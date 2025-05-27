export const endpoints = {
  common: {
    maintenance: 'common/maintenance',
    contactUs: 'common/contact-us',
  },
  auth: {
    refreshAccessToken: 'auth/refresh-access-token',
    login: 'auth/login',
    register: 'auth/register',
    forgottenPassword: 'auth/password/forgotten',
    resetPassword: 'auth/password/reset',
    changePassword: 'auth/password/change',
    changeEmail: 'auth/email/change',
  },
  user: {
    getUser: 'user/get',
    getEndUsersAsAdmin: 'user/admin/get',
    getEndUsersChunkAsAdmin: 'user/admin/get/chunk/:from/:to/:sort/:sortDirection',
  },
  product: {
    getProductsChunk: 'cnfans/products/chunk/:from/:to',
    getCNFansProductDetail: 'cnfans/products/:id/:platform',
    getFinishedProduct: 'cnfans/products/:id/:platform/r',
    saveCNFansProduct: 'cnfans/products/:id/:platform/save',
  },
  exchangeRate: {
    getRate: 'exchange-rate/rate',
  },
};
