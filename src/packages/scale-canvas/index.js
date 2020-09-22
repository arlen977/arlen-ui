/*
 * @Author: zhaozy 
 * @Date: 2020-09-08 18:12:37 
 * @Last Modified by:   zhaozy 
 * @Last Modified time: 2020-09-08 18:12:37 
 */
import AScaleCanvas from './src/aScaleCanvas.vue'

AScaleCanvas.install = function (Vue) {
    Vue.component(AScaleCanvas.name, AScaleCanvas);
};
export default AScaleCanvas;