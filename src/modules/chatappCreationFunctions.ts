import { 
    addUrl,
    asUrl,
    buildThing,
    createContainerAt,
    createContainerInContainer,
    createSolidDataset, 
    createThing, 
    getPodUrlAll, 
    getProfileAll, 
    getSolidDataset, 
    getSourceUrl, 
    getThing, 
    getThingAll, 
    getUrl, 
    isContainer, 
    saveSolidDatasetAt,
    saveSolidDatasetInContainer,
    setThing, 
    setUrl, 
    SolidDataset, 
    Thing, 
    UrlString,
    WebId,
    WithResourceInfo,
    getSolidDatasetWithAcl,
    hasResourceAcl,
    hasAccessibleAcl,
    hasFallbackAcl,
    createAclFromFallbackAcl,
    AclDataset,
    getResourceAcl,
    setPublicDefaultAccess,
    getAgentDefaultAccess,
    setAgentResourceAccess,
    saveAclFor,
    getAgentAccess,
    getPublicDefaultAccess,
    setPublicResourceAccess,
} from "@inrupt/solid-client";
import { DCTERMS, RDF, RDFS } from "@inrupt/vocab-common-rdf";
import { getChatroomIndexUrlAll } from "./chatappExplorationFunctions";
import { changeProfileImage } from "./profileFunctions";
import { getPrivateTypeIndexUrlAll, getPublicTypeIndexUrlAll } from "./profileTypeIndex";
import { SIOC, SIOCT, SOLID } from "./vocab";

declare const internal_defaultFetchOptions: {
    fetch: ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & typeof fetch;
};

export async function createChatroomIndex (
    webId: WebId,
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
): Promise<SolidDataset> {
    const testUrl = new URL((await getPodUrlAll(webId, options))[0]);
    testUrl.pathname = (testUrl.pathname + '/private/chatrooms.ttl').replace(/(\/)\/+/g, "$1"); // Remove double URLs
    const chatroomIndexUrl = prompt("Create chatroom index at ?", testUrl.toString())

    let chatroomIndexDS = createSolidDataset();
    chatroomIndexDS = setThing(chatroomIndexDS,
        setUrl(
            createThing({ name: '' }), 
            RDF.type, SOLID.TypeIndex
        )
    );
    chatroomIndexDS = await saveSolidDatasetAt(chatroomIndexUrl, chatroomIndexDS, options);

    const typeIndexUrl = (await getPrivateTypeIndexUrlAll(webId, options))[0] || (await getPublicTypeIndexUrlAll(webId, options))[0] || (await getProfileAll(webId, options))[0];
    const chatroomIndex = buildThing(createThing())
        .setUrl(RDF.type, SOLID.TypeRegistration)
        .setUrl(SOLID.forClass, SIOCT.ChatChannel)
        .setUrl(SOLID.instance, getSourceUrl(chatroomIndexDS))
        .build();
    await saveSolidDatasetAt(
        typeIndexUrl, 
        setThing(await getSolidDataset(typeIndexUrl, options), chatroomIndex), 
        options
    );

    return chatroomIndexDS;
}

export async function addChatroom (
    webId: WebId,
    chatroomUrl: UrlString,
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
): Promise<Thing> {
    const chatroomDS = await getSolidDataset(chatroomUrl, options);
    const chatroom = getThing(chatroomDS, chatroomUrl);
    if (getUrl(chatroom, RDF.type) !== SIOCT.ChatChannel) {
        throw new Error(`${chatroomUrl} is not a chatroom (sioct:ChatChannel)`);
    }

    let indexUrl: UrlString;    
    const indexUrlAll = await getChatroomIndexUrlAll(webId, options);
    if (indexUrlAll.length === 0) {
        indexUrl = getSourceUrl(await createChatroomIndex(webId, options));
    } else {
        indexUrl = indexUrlAll[0];
    }

    const chatroomEntry = setUrl(createThing({ url: chatroomUrl }), RDF.type, SIOCT.ChatChannel);
    const indexDS = setThing(await getSolidDataset(indexUrl, options), chatroomEntry);
    await saveSolidDatasetAt(indexUrl, indexDS, options);
    return chatroom;
}

export async function createChatroom (
    webId: WebId,
    title: string,
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
) {
    const created = new Date();
    const chatroomL = buildThing(createThing({ name: "this" }))
        .setUrl(RDF.type, SIOCT.ChatChannel)
        .setUrl(DCTERMS.creator, webId)
        .setStringEnglish(DCTERMS.title, title)
        .setDatetime(DCTERMS.created, created)
        .build();
    
    const podUrl = new URL((await getPodUrlAll(webId, options))[0]);
    podUrl.pathname = (podUrl.pathname + '/public/chatrooms/').replace(/(\/)\/+/g, "$1");
    let chatroomsContainerUrl: UrlString = podUrl.toString();

    let chatroomDS = await createContainerInContainer(chatroomsContainerUrl, { ...options, slugSuggestion: title.replaceAll(' ', '') })
        .catch(async () => {
            chatroomsContainerUrl = getSourceUrl( await createContainerAt(chatroomsContainerUrl, options));
            return await createContainerInContainer(chatroomsContainerUrl, { ...options, slugSuggestion: title.replaceAll(' ', '') });
        });
    chatroomDS = setThing(chatroomDS, chatroomL);
    chatroomDS = await saveSolidDatasetAt(getSourceUrl(chatroomDS), chatroomDS, options);

    const chatroomDSWithAcl = await getSolidDatasetWithAcl(getSourceUrl(chatroomDS), options);
    let resourceAcl: AclDataset;
    if (!hasResourceAcl(chatroomDSWithAcl)) {
        if (!hasAccessibleAcl(chatroomDSWithAcl))
            throw new Error("The current user does not have permissions to change access rights to this Resource.");
        if (!hasFallbackAcl(chatroomDSWithAcl))
            throw new Error("The current user does not have premissions to see who currently has access to this Resource.");
        resourceAcl = createAclFromFallbackAcl(chatroomDSWithAcl);
    } else {
        resourceAcl = getResourceAcl(chatroomDSWithAcl);
    }
    const updatedAclPrivate = setAgentResourceAccess(resourceAcl, webId, { read: true, append: true, write: true, control: true });
    const updatedAclDefault = setPublicDefaultAccess(updatedAclPrivate, { read: true, append: true, write: false, control: false });
    const updatedAcl = setPublicResourceAccess(updatedAclDefault, { read: true, append: true, write: false, control: false });
    await saveAclFor(chatroomDSWithAcl, updatedAcl, options);

    const chatroom = getThingAll(chatroomDS).filter((thing) => getUrl(thing, RDF.type) === SIOCT.ChatChannel)[0];

    return await addChatroom(webId, asUrl(chatroom), options);
}

export async function postChatMessage(
    webId: WebId,
    content: string,
    chatroom: Thing & WithResourceInfo,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
) {
    const created = new Date();
    const year = created.getFullYear();
    const month = created.getMonth() + 1;
    const day = created.getDate();

    const messageName = created.getTime() + Math.random().toString().substring("0.".length, 6);

    const message = buildThing(createThing({ name: messageName }))
        .addUrl(RDF.type, SIOCT.InstantMessage)
        .addUrl(SIOC.has_creator, webId)
        .addDatetime(DCTERMS.created, created)
        .addStringEnglish(SIOC.content, content)
        .build();

    const chatroomContainerUrl = new URL(asUrl(chatroom));
    chatroomContainerUrl.hash = '';
    const dsUrl = new URL(chatroomContainerUrl);
    dsUrl.pathname = (dsUrl.pathname + `/${year}/${month}/${day}.ttl`).replace(/(\/)\/+/g, "$1");

    let ds = await getSolidDataset(dsUrl.toString(), options).catch(async () => {
        let yearContainer: SolidDataset & WithResourceInfo, 
            monthContainer: SolidDataset & WithResourceInfo;
        const yearContainerUrl = new URL(chatroomContainerUrl);
        yearContainerUrl.pathname = (yearContainerUrl.pathname + `/${year}/`).replace(/(\/)\/+/g, "$1");
        try {
            yearContainer = await getSolidDataset(yearContainerUrl.toString(), options);
        } catch {
            yearContainer = await createContainerInContainer(chatroomContainerUrl.toString(), { ...options, slugSuggestion: `${year}/` });
        }
        const monthContainerUrl = new URL(getSourceUrl(yearContainer));
        monthContainerUrl.pathname = (monthContainerUrl.pathname + `/${month}/`).replace(/(\/)\/+/g, "$1");
        try {
            monthContainer = await getSolidDataset(monthContainerUrl.toString(), options);
        } catch {
            monthContainer = await createContainerInContainer(getSourceUrl(yearContainer), { ...options, slugSuggestion: `${month}/` });
        }

        const ds = await saveSolidDatasetInContainer(getSourceUrl(monthContainer), createSolidDataset(), { ...options, slugSuggestion: `${day}.ttl`});
        
        const newChatroom = addUrl(chatroom, RDFS.seeAlso, getSourceUrl(ds));
        const chatroomUrl = asUrl(chatroom);
        const chatroomDS = setThing(await getSolidDataset(chatroomUrl, options), newChatroom);
        saveSolidDatasetAt(chatroomUrl, chatroomDS, options);
        return ds;
    });
    
    const messageUrl = new URL(getSourceUrl(ds));
    messageUrl.hash = messageName;

    ds = setThing(ds, message);
    let chatroomIndex = getThing(ds, asUrl(chatroom)) || createThing({ url: asUrl(chatroom) });
    chatroomIndex = addUrl(chatroomIndex, SIOC.containerOf, messageUrl.toString());
    ds = setThing(ds, chatroomIndex);
    ds = await saveSolidDatasetAt(getSourceUrl(ds), ds, options);

    return getThing(ds, messageUrl.toString());
}