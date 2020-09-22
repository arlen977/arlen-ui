/* * @Author: zhaozy * @Date: 2020-09-08 18:16:35 * @Last Modified by: zhaozy * @Last Modified time: 2020-09-08 18:16:35 */

<template>
  <canvas :id="canvasId" :width="canvasW" :height="canvasH">浏览器不兼容</canvas>
</template>
<script>
export default {
  name: "AScaleCanvas",
  props: {
    canvasId: {
      type: String,
    },
    // 绘制的图片
    img: {
      type: [String, Object],
    },
    // 是否需要绘制矩形以及对应参数
    rectOp: {
      type: Object,
      default: () => ({ draw: false }),
    },
    // 加载失败 展示图片
    errorImg: {
      type: [String, Function],
    },
    // 是否可以缩放以及拖动
    scale: {
      type: Boolean,
      default: false,
    },
    // 自定义宽高
    customWH: {
      type: Object,
      default: () => ({
        type: false,
      }),
    },
    canvasW: {
      type: Number,
    },
    canvasH: {
      type: Number,
    },
  },
  data() {
    return {
      // 图片失败展示图
      errorImgSrc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598442436738&di=1f144c1bd46976f943b5b9e5dbe7bc56&imgtype=0&src=http%3A%2F%2Fgss0.baidu.com%2F9fo3dSag_xI4khGko9WTAnF6hhy%2Fzhidao%2Fpic%2Fitem%2Fb21bb051f8198618bc6da66f4ced2e738bd4e637.jpg",
      imgX: 0, //画布X轴坐标
      imgY: 0, //画布Y轴坐标
      imgScale: 1, //当前放大倍数
      isMouseDown: false, //鼠标操作状态
      currentRate: 0, //当前比率
      canvas: "", //canvas容器
      cs: "", //绘图的环境当前仅支持2D（未来可能支持3D）
      imgObj: new Image(), // Image 对象
      mouseDownLocation: "", //鼠标坐标
    };
  },
  created() {},
  mounted() {
    this.init();
  },
  watch: {
    customWH: {
      handler(val) {
        this.init();
      },
      deep: true,
    },
  },
  methods: {
    init() {
      this.imgObj.src = this.img ? this.img : "";
      // this.imgObj.src =
      //   'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1598533099473&di=43196cda8dd1fe3a4baf4d39b51d15a8&imgtype=0&src=http%3A%2F%2Fattachments.gfan.com%2Fforum%2Fattachments2%2F201301%2F29%2F125313339n39z82ydzc32y.jpg';
      this.canvas = document.getElementById(this.canvasId);
      this.cs = this.canvas.getContext("2d");
      this.imgObj.onload = () => {
        // 如果不是自定义宽高
        if (!this.customWH.type) {
          console.log("ggggggggggggggg");
          console.log(this.imgObj.width);
          this.canvas.width = this.imgObj.width; //定位canvas宽度
          this.canvas.height = this.imgObj.height; //定位canvas高度
          this.draw();
        } else {
          this.$nextTick(() => {
            this.imgObj.width = this.customWH.canvasWidth;
            this.imgObj.height = this.customWH.canvasHeight;
            this.draw();
          });
        }
      };
      this.imgObj.onerror = () => {
        if (this.errorImg) {
          this.imgObj.src = this.errorImg;
        } else {
          this.imgObj.src = this.errorImgSrc;
        }
        this.imgObj.onload = () => {
          // 如果不是自定义宽高
          if (!this.customWH.type) {
            this.canvas.width = this.imgObj.width;
            this.canvas.height = this.imgObj.height;
            this.draw();
          } else {
            this.$nextTick(() => {
              this.imgObj.width = this.customWH.canvasWidth;
              this.imgObj.height = this.customWH.canvasHeight;
              this.draw();
            });
          }
        };
      };
      if (this.scale) {
        this.initMousewheel();
        this.onMousedown();
        this.onMouseup();
        this.onMousemove();
      }
    },
    // 绘制图像
    draw(clearEl = true) {
      this.cs.clearRect(0, 0, this.canvas.width * 2, this.canvas.height * 2);
      this.cs.drawImage(this.imgObj, this.imgX, this.imgY, this.canvas.width * this.imgScale, this.canvas.height * this.imgScale);
      if (clearEl) {
        this.drawRect();
      }
    },
    // 画矩形
    drawRect() {
      if (this.rectOp.draw) {
        this.cs.strokeStyle = this.rectOp.strokeStyle || "#F25555";
        this.cs.lineWidth = this.rectOp.lineWidth || 3;
        // 非自定义宽高
        if (!this.customWH.type) {
          // 矩形宽高
          const rect_width = this.rectOp.rect_width * this.imgScale || 100 * this.imgScale;
          const rect_height = this.rectOp.rect_height * this.imgScale || 100 * this.imgScale;
          // 矩形 x y
          const rect_x = this.rectOp.rect_x * ((this.imgObj.width * this.imgScale) / this.canvas.width) + this.imgX;
          const rect_y = this.rectOp.rect_y * ((this.imgObj.height * this.imgScale) / this.canvas.height) + this.imgY;
          this.cs.strokeRect(rect_x, rect_y, rect_width, rect_height); //绘制矩形（无填充）
        } else {
          // 指定宽高
          let { zoom_width, zoom_height } = this.scalingImage(this.imgObj, this.customWH.canvasWidth, this.customWH.canvasHeight);
          this.cs.strokeRect(this.rectOp.rect_x * zoom_width, this.rectOp.rect_y * zoom_height, this.rectOp.rect_width * zoom_width, this.rectOp.rect_height * zoom_height);
        }
      }
    },
    // 注册滚轮事件
    initMousewheel() {
      this.canvas.addEventListener(
        "mousewheel",
        (event) => {
          //获取鼠标在当前容器的坐标
          var newMouseLocation = this.windowToCanvas(this.canvas, event.clientX, event.clientY);
          var x = newMouseLocation.x;
          var y = newMouseLocation.y;

          if (event.deltaY > 0) {
            //鼠标滚轮放大
            this.imgScale *= 2;
            this.imgX = this.imgX * 2 - x;
            this.imgY = this.imgY * 2 - y;
          } else {
            //鼠标滚轮缩小
            // 允许缩放最小值
            if (this.imgScale > 0.2) {
              this.imgScale *= 0.5;
              this.imgX = this.imgX * 0.5 + x * 0.5;
              this.imgY = this.imgY * 0.5 + y * 0.5;
            }

            // //禁止缩放留白
            // if(imgScale < 1){
            //   imgScale=1;
            //   imgX = 0;
            //   imgY = 0;
            // }
            // preventNull();  //防止容器留白
          }
          this.draw();
          event.preventDefault();
        },
        false
      );
    },
    // windowToCanvas此方法用于鼠标所在点的坐标切换到画布上的坐标
    windowToCanvas(canvas, x, y) {
      var bbox = this.canvas.getBoundingClientRect();
      return {
        x: x - bbox.left - (bbox.width - this.canvas.width) / 2,
        y: y - bbox.top - (bbox.height - this.canvas.height) / 2,
      };
    },
    //鼠标按下
    onMousedown() {
      this.canvas.onmousedown = (event) => {
        this.mouseDownLocation = this.windowToCanvas(this.canvas, event.clientX, event.clientY);
        if (this.isPointInImageArea(this.mouseDownLocation)) {
          this.isMouseDown = true;
        }
      };
    },
    //鼠标弹起
    onMouseup() {
      document.body.onmouseup = () => {
        this.canvas.style.cursor = "default";
        this.isMouseDown = false;
      };
    },
    //鼠标移动
    onMousemove() {
      this.canvas.onmousemove = (event) => {
        if (this.isMouseDown) {
          this.canvas.style.cursor = "move";
          var newMouseLocation = this.windowToCanvas(this.canvas, event.clientX, event.clientY);
          if (this.isDivArea({ x: event.clientX, y: event.clientY })) {
            var x = newMouseLocation.x - this.mouseDownLocation.x;
            var y = newMouseLocation.y - this.mouseDownLocation.y;
            this.mouseDownLocation = newMouseLocation;
            this.imgX += x;
            this.imgY += y;
          } else {
            //鼠标移动至画布范围外，置鼠标弹起
            this.canvas.style.cursor = "default";
            this.isMouseDown = false;
          }

          // //限制图片拖动留白
          // if(imgScale * img.width <= canvas.width){
          //   imgX = 0,imgY = 0;
          // }else{
          //   preventNull();
          // }
          this.draw();
        }
      };
    },
    // 指定显示图片宽高时,等比缩放图片
    scalingImage(ImgObj, maxWidth, maxHeight) {
      var image = new Image();
      //原图片原始地址（用于获取原图片的真实宽高，当<img>标签指定了宽、高时不受影响）
      image.src = ImgObj.src;
      // 用于设定图片的宽度和高度
      var tempWidth;
      var tempHeight;

      if (image.width > 0 && image.height > 0) {
        //原图片宽高比例 大于 指定的宽高比例，这就说明了原图片的宽度必然 > 高度
        if (image.width / image.height >= maxWidth / maxHeight) {
          if (image.width > maxWidth) {
            tempWidth = maxWidth;
            // 按原图片的比例进行缩放
            tempHeight = (image.height * maxWidth) / image.width;
          } else {
            // 按原图片的大小进行缩放
            tempWidth = image.width;
            tempHeight = image.height;
          }
        } else {
          // 原图片的高度必然 > 宽度
          if (image.height > maxHeight) {
            tempHeight = maxHeight;
            // 按原图片的比例进行缩放
            tempWidth = (image.width * maxHeight) / image.height;
          } else {
            // 按原图片的大小进行缩放
            tempWidth = image.width;
            tempHeight = image.height;
          }
        }
        // 设置页面图片的宽和高
        ImgObj.height = tempHeight;
        ImgObj.width = tempWidth;
        // 提示图片的原来大小
        ImgObj.alt = image.width + "×" + image.height;
        return {
          zoom_width: maxWidth / image.width,
          zoom_height: maxHeight / image.height,
        };
      }
    },
    isPointInImageArea(point) {
      return true;
    },
    isDivArea(point) {
      return true;
    },
    // 重绘 false 保留图片 ture 重绘所有
    clearRect(bool) {
      this.draw(bool);
    },
  },
};
</script>
