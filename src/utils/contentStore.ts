import { homePageData } from "../pageData/homePage";
import { practicePageData } from "../pageData/practicePage";

const ADMIN_STORAGE_KEY = "pmp-admin-data";

export interface ContentStoreData {
  homePageData: typeof homePageData;
  practicePageData: typeof practicePageData;
}

export function loadAdminData(): ContentStoreData {
  if (typeof window === "undefined") {
    return loadDefaultAdminData();
  }

  const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) {
    return loadDefaultAdminData();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ContentStoreData>;
    const mergedHomePageData = {
      ...homePageData,
      ...parsed.homePageData,
      style: {
        ...homePageData.style,
        ...parsed.homePageData?.style,
        main: {
          ...homePageData.style.main,
          ...parsed.homePageData?.style?.main,
        },
        topMenu: {
          ...homePageData.style.topMenu,
          ...parsed.homePageData?.style?.topMenu,
        },
        buttons: {
          ...homePageData.style.buttons,
          ...parsed.homePageData?.style?.buttons,
        },
        bookshelf: {
          ...homePageData.style.bookshelf,
          ...parsed.homePageData?.style?.bookshelf,
        },
        tabs: {
          ...homePageData.style.tabs,
          ...parsed.homePageData?.style?.tabs,
        },
        hero: {
          ...homePageData.style.hero,
          ...parsed.homePageData?.style?.hero,
        },
        wizardTopInfo: {
          ...homePageData.style.wizardTopInfo,
          ...parsed.homePageData?.style?.wizardTopInfo,
        },
        wizardWorkspace: {
          ...homePageData.style.wizardWorkspace,
          ...parsed.homePageData?.style?.wizardWorkspace,
        },
        wizardButtons: {
          ...homePageData.style.wizardButtons,
          ...parsed.homePageData?.style?.wizardButtons,
        },
        emptyBook: {
          ...homePageData.style.emptyBook,
          ...parsed.homePageData?.style?.emptyBook,
        },
      },
    };
    // Normalize any "*Middle" gradient fields that are empty strings or undefined
    // to their corresponding "*Start" value so CSS gradients remain valid.
    try {
      const styleObj: any = mergedHomePageData.style;
      Object.keys(styleObj).forEach((sectionKey) => {
        const section = styleObj[sectionKey];
        if (section && typeof section === "object") {
          Object.keys(section).forEach((prop) => {
            if (prop.endsWith("Middle")) {
              const val = section[prop];
              const startProp = prop.replace(/Middle$/, "Start");
              if (!val && section[startProp]) {
                section[prop] = section[startProp];
              }
            }
          });
        }
      });
    } catch {
      // ignore normalization errors and fall back to merged values
    }
    return {
      homePageData: mergedHomePageData,
      practicePageData: parsed.practicePageData ?? practicePageData,
    };
  } catch {
    return loadDefaultAdminData();
  }
}

export function saveAdminData(data: ContentStoreData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
}

export function resetAdminData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function hasAdminData(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_STORAGE_KEY) !== null;
}

export function getHomePageData(): typeof homePageData {
  return loadAdminData().homePageData;
}

export function getPracticePageData(): typeof practicePageData {
  return loadAdminData().practicePageData;
}

export function loadDefaultAdminData(): ContentStoreData {
  return {
    homePageData,
    practicePageData,
  };
}
