/*
 * @Author: zhaozy 
 * @Date: 2020-09-08 18:24:33 
 * @Last Modified by:   zhaozy 
 * @Last Modified time: 2020-09-08 18:24:33 
 */

import ScaleCanvas from './packages/scale-canvas/index.js'

const components = [
    ScaleCanvas
]

const install = function (Vue, opts = {}) {
    components.forEach(component => {
        Vue.component(component.name, component);
    });
}
/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install,
    ScaleCanvas
}