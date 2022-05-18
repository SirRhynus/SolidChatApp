import { getPodUrlAll, getSolidDataset, getSourceUrl, getThing, saveFileInContainer, saveSolidDatasetAt, setStringNoLocale, setThing, setUrl, SolidDataset, Url, WebId, WithResourceInfo } from "@inrupt/solid-client";
import { SIOC } from "./vocab";

declare const internal_defaultFetchOptions: {
    fetch: ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & typeof fetch;
};

export async function changeProfileImage(
    webId: WebId,
    file: File,
    options: Partial<typeof internal_defaultFetchOptions>
): Promise<SolidDataset> {
    const profileDS = await getSolidDataset(webId, options);
    const profile = getThing(profileDS, webId);
    const pod = (await getPodUrlAll(webId, options))[0];
    console.log(pod);
    const savedFile = await saveFileInContainer(pod, file, { ...options, slug: file.name });
    const updatedProfile = setUrl(profile, SIOC.avatar, getSourceUrl(savedFile));
    return await saveSolidDatasetAt(webId, setThing(profileDS, updatedProfile), options);
}

export async function updateString(
    webId: WebId,
    property: string | Url,
    value: string,
    options: Partial<typeof internal_defaultFetchOptions>
): Promise<SolidDataset & WithResourceInfo> {
    const profileDS = await getSolidDataset(webId, options);
    const profile = getThing(profileDS, webId);
    const updatedProfile = setStringNoLocale(profile, property, value);
    const updatedProfileDS = setThing(profileDS, updatedProfile);
    return await saveSolidDatasetAt(webId, updatedProfileDS, options);
}
