
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "preload": [
      "chunk-LBPSDLJU.js",
      "chunk-VOBQUM4P.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-F7CKIEE6.js",
      "chunk-NJHQRQ2S.js",
      "chunk-VOBQUM4P.js"
    ],
    "route": "/product/*"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-VFDEA7GP.js",
      "chunk-NJHQRQ2S.js",
      "chunk-VOBQUM4P.js"
    ],
    "route": "/admin"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-HNBBQU6Y.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 11665, hash: '5b2e24bb16246f79df8c3aba121c3f9fddf705988911001f28d80582a8284468', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 11984, hash: '5c1d6ad6d7154d55dddba99df16384374162d1fbb02423a91af2eb9b583b4107', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 30275, hash: '7ab4da81514a19bc0602d53bafa120335d82f172c676ce370158f3c540578273', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'admin/index.html': {size: 34461, hash: '125f86049f427adf474da3ac37414bfbfee28164861f4d4f5dca67107f45fc28', text: () => import('./assets-chunks/admin_index_html.mjs').then(m => m.default)},
    'index.html': {size: 34409, hash: '1d0be01dc535621539f27e8c4a83d1035451856402eb048f8f24ad5c51948833', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YIFNZ7ZE.css': {size: 611, hash: 'FeBMKcKx+yw', text: () => import('./assets-chunks/styles-YIFNZ7ZE_css.mjs').then(m => m.default)}
  },
};
