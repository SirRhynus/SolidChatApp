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
    getUrlAll,
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

async function getChatMessagesContainer(
    chatroom: Thing & WithResourceInfo,
    created: Date,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<SolidDataset & WithResourceInfo> {

    const year = created.getFullYear();
    const month = created.getMonth() + 1;
    const day = created.getDate();

    const chatroomContainerUrl = (() => {
        const chatroomContainerUrl = new URL(asUrl(chatroom));
        chatroomContainerUrl.hash = '';
        return chatroomContainerUrl.toString();
    })();
    let dsUrl = (() => {
        const dsUrl = new URL(chatroomContainerUrl);
        dsUrl.pathname = (dsUrl.pathname + `/${year}/${month}/${day}.ttl`).replace(/(\/)\/+/g, "$1");
        return dsUrl.toString();
    })();
    let  monthContainerUrl = (() => {
        const monthContainerUrl = new URL(chatroomContainerUrl);
        monthContainerUrl.pathname = (monthContainerUrl.pathname + `/${year}/${month}/`).replace(/(\/)\/+/g, "$1");
        return monthContainerUrl.toString();
    })();
    let yearContainerUrl = (() => {
        const yearContainerUrl = new URL(chatroomContainerUrl);
        yearContainerUrl.pathname = (yearContainerUrl.pathname + `/${year}/`).replace(/(\/)\/+/g, "$1");
        return yearContainerUrl.toString();
    })();

    const ds = await getSolidDataset(dsUrl, options).catch(async () => {
        const monthContainer = await getSolidDataset(monthContainerUrl, options).catch(async () => {
            const yearContainer = await getSolidDataset(yearContainerUrl, options).catch(async () => 
                await createContainerInContainer(chatroomContainerUrl, { ...options, slugSuggestion: `${year}/` })
            );
            yearContainerUrl = getSourceUrl(yearContainer);
            
            return await createContainerInContainer(yearContainerUrl, { ...options, slugSuggestion: `${month}/` });
        });
        monthContainerUrl = getSourceUrl(monthContainer);
        
        
        return await saveSolidDatasetInContainer(getSourceUrl(monthContainer), createSolidDataset(), { ...options, slugSuggestion: `${day}.ttl`});
    });
    dsUrl = getSourceUrl(ds);
    
    const chatroomDS = await getSolidDataset(asUrl(chatroom), options);
    const chatroomThing = getThing(chatroomDS, asUrl(chatroom))
    if(!getUrlAll(chatroomThing, RDFS.seeAlso).some((url) => url === yearContainerUrl)) {
        const updatedChatroomThing = addUrl(chatroomThing, RDFS.seeAlso, yearContainerUrl);
        const updatedChatroomDS = setThing(chatroomDS, updatedChatroomThing);
        await saveSolidDatasetAt(asUrl(chatroom), updatedChatroomDS, options);
    }
    const yearContainer = await getSolidDataset(yearContainerUrl, options);
    const yearChatroomThing = getThing(yearContainer, asUrl(chatroom)) || createThing({ url: asUrl(chatroom) });
    if (!getUrlAll(yearChatroomThing, RDFS.seeAlso).some((url) => url === monthContainerUrl)) {
        const updatedYearChatroomThing = addUrl(yearChatroomThing, RDFS.seeAlso, monthContainerUrl);
        const updatedYearContainer = setThing(yearContainer, updatedYearChatroomThing);
        await saveSolidDatasetAt(yearContainerUrl, updatedYearContainer, options);
    }
    const monthContainer = await getSolidDataset(monthContainerUrl, options);
    const monthChatroomThing = getThing(monthContainer, asUrl(chatroom)) || createThing({ url: asUrl(chatroom) });
    if (!getUrlAll(monthChatroomThing, RDFS.seeAlso).some((url) => url === monthContainerUrl)) {
        const updatedMonthChatroomThing = addUrl(monthChatroomThing, RDFS.seeAlso, dsUrl);
        const updatedMonthContainer = setThing(monthContainer, updatedMonthChatroomThing);
        await saveSolidDatasetAt(monthContainerUrl, updatedMonthContainer, options);
    }

    return ds;
}

export async function postChatMessage(
    webId: WebId,
    content: string,
    chatroom: Thing & WithResourceInfo,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
) {
    const created = new Date();

    const messageName = created.getTime() + Math.random().toString().substring("0.".length, 6);

    const message = buildThing(createThing({ name: messageName }))
        .addUrl(RDF.type, SIOCT.InstantMessage)
        .addUrl(SIOC.has_creator, webId)
        .addDatetime(DCTERMS.created, created)
        .addStringEnglish(SIOC.content, content)
        .build();

    let ds = await getChatMessagesContainer(chatroom, created, options);    
    
    const messageUrl = new URL(getSourceUrl(ds));
    messageUrl.hash = messageName;

    ds = setThing(ds, message);
    let chatroomIndex = getThing(ds, asUrl(chatroom)) || createThing({ url: asUrl(chatroom) });
    chatroomIndex = addUrl(chatroomIndex, SIOC.containerOf, messageUrl.toString());
    ds = setThing(ds, chatroomIndex);
    ds = await saveSolidDatasetAt(getSourceUrl(ds), ds, options);

    return getThing(ds, messageUrl.toString());
}