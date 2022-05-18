import { AclDataset, createAclFromFallbackAcl, getPodUrlAll, getResourceAcl, getResourceInfoWithAcl, getSolidDataset, getSourceUrl, getThing, hasAccessibleAcl, hasFallbackAcl, hasResourceAcl, saveAclFor, saveFileInContainer, saveSolidDatasetAt, setPublicResourceAccess, setStringNoLocale, setThing, setUrl, SolidDataset, Url, WebId, WithResourceInfo } from "@inrupt/solid-client";
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
    const savedFile = await saveFileInContainer(pod, file, { ...options, slug: file.name });
    
    const savedFileWithAcl = await getResourceInfoWithAcl(getSourceUrl(savedFile), options);
    let savedFileAcl: AclDataset;
    if (!hasResourceAcl(savedFileWithAcl)) {
        if (!hasAccessibleAcl(savedFileWithAcl))
            throw new Error("The current user does not have permission to change access rights to this Resource.");
        if (!hasFallbackAcl(savedFileWithAcl))
            throw new Error("The current user does not have permissions to see who currently has access to this Resource.");
        savedFileAcl = createAclFromFallbackAcl(savedFileWithAcl);
    } else {
        savedFileAcl = getResourceAcl(savedFileWithAcl);
    }
    const updatedAcl = setPublicResourceAccess(savedFileAcl, { read: true, append: false, write: false, control: false });
    await saveAclFor(savedFileWithAcl, updatedAcl);

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
