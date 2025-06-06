import {
  buildApp,
  createAppByCode,
  createAppByCompose,
  createAppByDockerrun,
  createThirdPartyServices,
  createJarWarServices,
  createJarWarUploadStatus,
  deleteJarWarUploadStatus,
  createJarWarUploadRecord,
  createJarWarFormSubmit,
  createJarWarSubmit,
  createJarWarUpload,
  createThirtAppByCodes,
  getAppsByComposeId,
  installApp,
  installAppPlugin,
  changeAppVersions,
  installHelmApp,
  helmAppInstall,
  getHelmVersion,
  installHelmAppCmd,
  setNodeLanguage,
  installRamAppCmd,
  getAppByVirtualMachineImage,
  createAppByVirtualMachine,
  getImageRepositories,
  getImageTags,
  saveTarImageName,
  getHelmUploadChartInfo,
  checkHelmChartApp,
  getHelmChartYaml,
  installHelmUploadApp,
  updateCustomLanguage
} from '../services/createApp';

export default {
  namespace: 'createApp',

  state: {
    extend_method: '',
    min_memory: '',
    service_runtimes: '',
    service_server: '',
    service_dependency: ''
  },
  effects: {
    *getAppsByComposeId({ payload, callback }, { call }) {
      const data = yield call(getAppsByComposeId, payload);
      if (data && callback) {
        callback(data);
      }
    },
    *installApp({ payload, callback,handleError }, { call }) {
      const data = yield call(installApp, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *installAppPlugin({ payload, callback }, { call }) {
      const data = yield call(installAppPlugin, payload);
      if (data && callback) {
        callback(data);
      }
    },
    *changeAppVersions({ payload, callback }, { call }) {
      const data = yield call(changeAppVersions, payload);
      if (data && callback) {
        callback(data);
      }
    },
    *installHelmApp({ payload, callback }, { call }) {
      const data = yield call(installHelmApp, payload);
      if (data && callback) {
        callback(data);
      }
    },
    *createAppByCode({ payload, callback }, { call }) {
      const data = yield call(createAppByCode, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createThirtAppByCode({ payload, callback }, { call }) {
      const data = yield call(createThirtAppByCodes, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },

    *createThirdPartyServices({ payload, callback }, { call }) {
      const data = yield call(createThirdPartyServices, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createJarWarServices({ payload, callback }, { call }) {
      const data = yield call(createJarWarServices, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createJarWarUploadStatus({ payload, callback }, { call }) {
      const data = yield call(createJarWarUploadStatus, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createJarWarUploadRecord({ payload, callback }, { call }) {
      const data = yield call(createJarWarUploadRecord, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createJarWarUpload({ payload, callback }, { call }) {
      const data = yield call(createJarWarUpload, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createJarWarFormSubmit({ payload, callback }, { call }) {
      const data = yield call(createJarWarFormSubmit, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createJarWarSubmit({ payload, callback }, { call }) {
      const data = yield call(createJarWarSubmit, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    
    *deleteJarWarUploadStatus({ payload, callback }, { call }) {
      const data = yield call(deleteJarWarUploadStatus, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createAppByCompose({ payload, callback }, { call }) {
      const data = yield call(createAppByCompose, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *createAppByDockerrun({ payload, callback }, { call }) {
      const data = yield call(createAppByDockerrun, payload);
      if (data && callback) {
        setTimeout(() => {
          callback(data);
        });
      }
    },
    *buildApps({ payload, callback, handleError }, { call }) {
      const data = yield call(buildApp, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *helmAppInstall({ payload, callback, handleError }, { call }) {
      const data = yield call(helmAppInstall, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *getHelmVersion({ payload, callback, handleError }, { call }) {
      const data = yield call(getHelmVersion, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *installHelmAppCmd({ payload, callback, handleError }, { call }) {
      const data = yield call(installHelmAppCmd, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *setNodeLanguage({ payload, callback, handleError }, { call }) {
      const data = yield call(setNodeLanguage, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *installRamAppCmd({ payload, callback, handleError }, { call }) {
      const data = yield call(installRamAppCmd, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *createAppByVirtualMachine({ payload, callback, handleError }, { call }) {
      const data = yield call(createAppByVirtualMachine, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *getAppByVirtualMachineImage({ payload, callback, handleError }, { call }) {
      const data = yield call(getAppByVirtualMachineImage, payload, handleError);
      if (data && callback) {
        callback(data);
      }
    },
    *getImageRepositories({ payload, callback, handleError }, { call }) {
      const data = yield call(getImageRepositories, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *getImageTags({ payload, callback, handleError }, { call }) {
      const data = yield call(getImageTags, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *saveTarImageName({ payload, callback, handleError }, { call }) {
      const data = yield call(saveTarImageName, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *getHelmUploadChartInfo({ payload, callback, handleError }, { call }) {
      const data = yield call(getHelmUploadChartInfo, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *checkHelmChartApp({ payload, callback, handleError }, { call }) {
      const data = yield call(checkHelmChartApp, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *getHelmChartYaml({ payload, callback, handleError }, { call }) {
      const data = yield call(getHelmChartYaml, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *installHelmUploadApp({ payload, callback, handleError }, { call }) {
      const data = yield call(installHelmUploadApp, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
    *updateCustomLanguage({ payload, callback, handleError }, { call }) {
      const data = yield call(updateCustomLanguage, payload, handleError);
      if(data && callback) {
        callback(data);
      }
    },
  },

  reducers: {
    saveRuntimeInfo(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    clearRuntimeInfo() {
      return {
        extend_method: '',
        min_memory: '',
        service_runtimes: '',
        service_server: '',
        service_dependency: ''
      };
    }
  }
};
