import { getIriAll, getProfileAll, getSolidDataset, getThing, ProfileAll, SolidDataset, UrlString, WebId, WithServerResourceInfo } from "@inrupt/solid-client";
import { SOLID } from "./vocab";

declare const internal_defaultFetchOptions: {
    fetch: ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & typeof fetch;
};

export async function getPublicTypeIndexUrlAll(
    webId: WebId,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<UrlString[]> {
    const profiles = await getProfileAll(webId, options);
    return getPublicTypeIndexUrlAllFrom(profiles, webId);
}

export function getPublicTypeIndexUrlAllFrom(
    profiles: ProfileAll<SolidDataset & WithServerResourceInfo>,
    webId: WebId
): UrlString[] {
    const result: Set<string> = new Set();
  [profiles.webIdProfile, ...profiles.altProfileAll].forEach(
    (profileResource) => {
      const webIdThing = getThing(profileResource, webId);
      if (webIdThing !== null) {
        getIriAll(webIdThing, SOLID.publicTypeIndex).forEach((podIri) =>
          result.add(podIri)
        );
      }
    }
  );
  return Array.from(result);
}

export async function getPrivateTypeIndexUrlAll(
    webId: WebId,
    options: Partial<typeof internal_defaultFetchOptions> = internal_defaultFetchOptions
): Promise<UrlString[]> {
    const profiles = await getProfileAll(webId, options);
    return getPrivateTypeIndexUrlAllFrom(profiles, webId);
}

export function getPrivateTypeIndexUrlAllFrom(
    profiles: ProfileAll<SolidDataset & WithServerResourceInfo>,
    webId: WebId
): UrlString[] {
    const result: Set<string> = new Set();
  [profiles.webIdProfile, ...profiles.altProfileAll].forEach(
    (profileResource) => {
      const webIdThing = getThing(profileResource, webId);
      if (webIdThing !== null) {
        getIriAll(webIdThing, SOLID.privateTypeIndex).forEach((podIri) =>
          result.add(podIri)
        );
      }
    }
  );
  return Array.from(result);
}

export type ProfileAllWithIndexes<T extends SolidDataset & WithServerResourceInfo> = {
  webIdProfile: T;
  altProfileAll: Array<SolidDataset & WithServerResourceInfo>;
  privateTypeIndexAll: Array<SolidDataset & WithServerResourceInfo>;
  publicTypeIndexAll: Array<SolidDataset & WithServerResourceInfo>;
};

export async function getProfileAllWithIndexes<
  T extends SolidDataset & WithServerResourceInfo
>(
  webId: WebId,
  options?: Partial<
    typeof internal_defaultFetchOptions & {
      webIdProfile: T;
    }
  >
): Promise<ProfileAllWithIndexes<T>>;
export async function getProfileAllWithIndexes(
  webId: WebId,
  options?: Partial<
    typeof internal_defaultFetchOptions & {
      webIdProfile: undefined;
    }
  >
): Promise<ProfileAllWithIndexes<SolidDataset & WithServerResourceInfo>>;
export async function getProfileAllWithIndexes<
  T extends SolidDataset & WithServerResourceInfo
>(
  webId: WebId,
  options: Partial<
    typeof internal_defaultFetchOptions & {
      webIdProfile: T;
    }
  > = internal_defaultFetchOptions
): Promise<ProfileAllWithIndexes<T | (SolidDataset & WithServerResourceInfo)>> {;
  const profiles = await getProfileAll(webId, options);

  const privateTypeIndexAll = (
    await Promise.allSettled(
      getPrivateTypeIndexUrlAllFrom(profiles, webId).map((privateTypeIndexIri) => 
        getSolidDataset(privateTypeIndexIri, options)
      )
    )
  ).filter(
      (result): result is PromiseFulfilledResult<T> => 
        result.status === "fulfilled"
  ).map((successfulResult) => successfulResult.value)
    
  const publicTypeIndexAll = (
    await Promise.allSettled(
      getPublicTypeIndexUrlAllFrom(profiles, webId).map((publicTypeIndexIri) => 
        getSolidDataset(publicTypeIndexIri, options)
      )
    )
  ).filter(
    (result): result is PromiseFulfilledResult<T> =>
      result.status === "fulfilled"
  ).map((successfulResult) => successfulResult.value);

  const { webIdProfile, altProfileAll } = profiles;
  return {
      webIdProfile,
      altProfileAll,
      privateTypeIndexAll,
      publicTypeIndexAll
  }
}
