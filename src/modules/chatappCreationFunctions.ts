import { 
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
    setThing, 
    setUrl, 
    SolidDataset, 
    Thing, 
    UrlString,
    WebId, 
} from "@inrupt/solid-client";
import { DCTERMS, RDF } from "@inrupt/vocab-common-rdf";
import { getChatroomIndexUrlAll } from "./chatappExplorationFunctions";
import { getPrivateTypeIndexUrlAll, getPublicTypeIndexUrlAll } from "./profileTypeIndex";
import { SIOCT, SOLID } from "./vocab";

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
    if (!isContainer(chatroomsContainerUrl)) {
        chatroomsContainerUrl = getSourceUrl( await createContainerAt(podUrl.toString(), options) );
    }

    let chatroomDS = await createContainerInContainer(chatroomsContainerUrl, options);
    chatroomDS = setThing(chatroomDS, chatroomL);
    chatroomDS = await saveSolidDatasetAt(getSourceUrl(chatroomDS), chatroomDS, options);

    const chatroom = getThingAll(chatroomDS).filter((thing) => getUrl(thing, RDF.type) === SIOCT.ChatChannel)[0];

    return await addChatroom(webId, asUrl(chatroom), options);
}