import { asUrl, getDatetime, getSolidDataset, getThing, getThingAll, getUrl, getUrlAll, SolidDataset, Thing, Url, UrlString, WebId, WithServerResourceInfo } from "@inrupt/solid-client";
import { DCTERMS, RDF, RDFS } from "@inrupt/vocab-common-rdf";
import { getProfileAllWithIndexes, ProfileAllWithIndexes } from "./profileTypeIndex";
import { SIOC, SIOCT, SOLID } from "./vocab";

declare const internal_defaultFetchOptions: {
    fetch: ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & typeof fetch;
};

export async function getChatroomIndexUrlAll(
    webId: WebId,
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
): Promise<UrlString[]> {
    const profiles = await getProfileAllWithIndexes(webId, options);
    return getChatroomIndexUrlAllFrom(profiles);
}

export function getChatroomIndexUrlAllFrom(
    profiles: ProfileAllWithIndexes<SolidDataset & WithServerResourceInfo>
): UrlString[] {
    const {webIdProfile, altProfileAll, publicTypeIndexAll, privateTypeIndexAll} = profiles;
    const result: Set<string> = new Set();
    [webIdProfile, ...altProfileAll, ...publicTypeIndexAll, ...privateTypeIndexAll].forEach(
        (profilesResource) => {
            getThingAll(profilesResource)
                .filter((thing) => getUrl(thing, RDF.type) === SOLID.TypeRegistration)
                .filter((thing) => getUrl(thing, SOLID.forClass) === SIOCT.ChatChannel)
                .map((thing) => getUrl(thing, SOLID.instance) || getUrl(thing, SOLID.instanceContainer))
                .forEach(url => result.add(url));
        }
    );
    return Array.from(result);
}

export async function getChatroomUrlAll(
    webId: WebId,
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
): Promise<UrlString[]> {
    const chatroomAll = (
        await Promise.allSettled(
            (await getChatroomIndexUrlAll(webId, options)).map(indexUrl => 
                getSolidDataset(indexUrl, options)
            )
        )
    ).filter(
        (result): result is PromiseFulfilledResult<SolidDataset & WithServerResourceInfo> => 
            result.status === "fulfilled"
    ).map(
        (succesfulResult) => succesfulResult.value
    ).reduce((acc: Array<Thing>, ds) => 
        acc.concat(acc, getThingAll(ds))
    , []).filter((thing) => 
        getUrl(thing, RDF.type) === SIOCT.ChatChannel
    ).map((thing) => 
        asUrl(thing)
    )
    return chatroomAll;
}

export async function getChatroomAll(
    webId: WebId,
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
): Promise<Thing[]> {
    const chatroomUrlAll = await getChatroomUrlAll(webId, options);
    return await getChatroomAllFrom(chatroomUrlAll, options);
}

export async function getChatroomAllFrom(
    chatroomUrlAll: UrlString[],
    options: Partial<
        typeof internal_defaultFetchOptions
    > = internal_defaultFetchOptions
): Promise<Thing[]> {
    return (await Promise.all(
        chatroomUrlAll.map(async (chatroomUrl) => {
            try {
                const ds = await getSolidDataset(chatroomUrl, options);
                const chatroom = getThing(ds, chatroomUrl);
                return chatroom;
            } catch {
                return null;
            }
        })
    )).filter(thing => thing !== null);
}

export async function getChatMessageUrlAllFromUrl(
    chatroomUrl: UrlString, 
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<UrlString[]> {
    const chatroomDS = await getSolidDataset(chatroomUrl, options);
    const chatroom = getThing(chatroomDS, chatroomUrl);
    return await getChatMessageUrlAllFrom(chatroom, options);
}

export function mergeThing(
    thing: Thing,
    addThing: Thing
): Thing {
    if (asUrl(thing) !== asUrl(addThing))
        throw new Error(`Thing with URL ${asUrl(thing)} cannot be merged with Thing with URL ${asUrl(addThing)}: URLs don't match`);
    
    const updatedPredicates = Object.entries(addThing.predicates).reduce((existingPredicates, [predicate, object]) => {
        const existingPredicate = existingPredicates[predicate] ?? {};

        const existingLiterals = existingPredicate.literals ?? {};
        const updatedLiterals = Object.entries(object.literals ?? {}).reduce((existingLiterals, [type, value]) => {
            const existingValuesOfType = existingLiterals[type] ?? [];
            const updatedValuesOfType = Object.freeze(existingValuesOfType.concat(value));
            return Object.freeze({
                ...existingLiterals,
                [type]: updatedValuesOfType
            });
        }, existingLiterals);

        const existingLangStrings = existingPredicate.langStrings ?? {};
        const updatedLangStrings = Object.entries(object.langStrings ?? {}).reduce((existingLangStrings, [locale, value]) => {
            const existingStringsInLocale = existingLangStrings[locale] ?? [];
            const updatedStringInLocale = Object.freeze(existingStringsInLocale.concat(value));
            return Object.freeze({
                ...existingLangStrings,
                [locale]: updatedStringInLocale
            });
        }, existingLangStrings);

        const existingNamedNodes = existingPredicate.namedNodes ?? [];
        const updatedNamedNodes = object.namedNodes?.reduce((existingNamedNodes, value) => Object.freeze(existingNamedNodes.concat(value)), existingNamedNodes);

        const existingBlankNodes = existingPredicate.blankNodes ?? [];
        const updatedBlankNodes = object.blankNodes?.reduce((existingBlankNodes, value) => Object.freeze(existingBlankNodes.concat(value)), existingBlankNodes);

        const updatedPredicate = Object.freeze({
            ...existingPredicate,
            literals: updatedLiterals,
            langStrings: updatedLangStrings,
            namedNodes: updatedNamedNodes,
            blankNodes: updatedBlankNodes
        });

        return Object.freeze({
            ...existingPredicates,
            [predicate]: updatedPredicate
        });
    }, thing.predicates);

    return Object.freeze({
        ...thing,
        predicates: updatedPredicates
    });
}

export async function getExtendedThing(
    url: UrlString,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<Thing> {
    const ds = await getSolidDataset(url, options);
    const thing = getThing(ds, url);
    return await getExtendedThingFrom(thing, options);
}

export async function getExtendedThingFrom(
    thing: Thing,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<Thing> {
    return (await Promise.allSettled(
        getUrlAll(thing, RDFS.seeAlso).map((url) => getSolidDataset(url, options))
    )).filter(
        (result): result is PromiseFulfilledResult<SolidDataset & WithServerResourceInfo> => 
            result.status === "fulfilled"
    ).map(
        (successfulResult) => getThing(successfulResult.value, asUrl(thing))
    ).reduce(mergeThing, thing);
}

export async function getChatMessageUrlAllFrom(
    chatroom: Thing,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<UrlString[]> {
    const extendedChatroom = await getExtendedThing(asUrl(chatroom), options);
    return getUrlAll(extendedChatroom, SIOC.containerOf);
}

export async function getChatMessageAllFrom(
    chatroom: Thing,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<Thing[]> {
    const chatMessageUrlAll = (await getChatMessageUrlAllFrom(chatroom, options))
        .sort((a, b) => (a < b) ? 1 : -1);
    const thingAll: Thing[] = [];
    const cache = new Map<UrlString, SolidDataset>();
    for (const messageUrl of chatMessageUrlAll) {
        const baseUrl = new URL(messageUrl);
        baseUrl.hash = '';
        if (!cache.has(baseUrl.toString())) {
            let ds: SolidDataset;
            try {
                ds = await getSolidDataset(baseUrl.toString(), options);
            } catch {
                ds = null;
            }
            cache.set(baseUrl.toString(), ds);
        }
        const ds = cache.get(baseUrl.toString());
        if (ds !== null)
            thingAll.push(getThing(ds, messageUrl));
    }
    return thingAll;
}

export async function getChatMessageAllPast(
    datetime: Date,
    chatroom: Thing,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<Thing[]> {
    const messagesAll = await getChatMessageAllFrom(chatroom, options);
    return messagesAll.filter((message) => { 
        const newDate = new Date(getDatetime(message, DCTERMS.created));
        const result = newDate > datetime;
        return result;
    });
}