import { asUrl, getContainedResourceUrlAll, getSolidDataset, getThing, getThingAll, getUrl, SolidDataset, Thing, UrlString, WebId, WithServerResourceInfo } from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import { getProfileAllWithIndexes, ProfileAllWithIndexes } from "./profileTypeIndex";
import { SIOCT, SOLID } from "./vocab";

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
    return await Promise.all(
        chatroomUrlAll.map(async (chatroomUrl) => {
            const ds = await getSolidDataset(chatroomUrl, options);
            const chatroom = getThing(ds, chatroomUrl);
            return chatroom;
        })
    )
}