<template>
  <div class="captcha-container">
    <div class="captcha-image" @click="refreshCaptcha">
      <canvas
        ref="captchaCanvas"
        :width="width"
        :height="height"
        class="captcha-canvas"
      ></canvas>
      <div class="refresh-hint">
        <i class="el-icon-refresh"></i>
        <span>点击刷新</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CaptchaProps {
  width?: number;
  height?: number;
  length?: number;
}

interface CaptchaEmits {
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<CaptchaProps>(), {
  width: 120,
  height: 40,
  length: 4
});

const emit = defineEmits<CaptchaEmits>();

const captchaCanvas = ref<HTMLCanvasElement>();
const captchaCode = ref('');

// 验证码字符集（去除容易混淆的字符）
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// 生成随机验证码
const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < props.length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 获取随机颜色
const getRandomColor = (min: number = 0, max: number = 255): string => {
  const r = Math.floor(Math.random() * (max - min + 1)) + min;
  const g = Math.floor(Math.random() * (max - min + 1)) + min;
  const b = Math.floor(Math.random() * (max - min + 1)) + min;
  return `rgb(${r},${g},${b})`;
};

// 绘制验证码
const drawCaptcha = () => {
  if (!captchaCanvas.value) return;
  
  const canvas = captchaCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height);
  
  // 设置背景色
  ctx.fillStyle = getRandomColor(240, 255);
  ctx.fillRect(0, 0, props.width, props.height);
  
  // 生成新的验证码
  captchaCode.value = generateCode();
  
  // 绘制验证码文字
  const fontSize = Math.floor(props.height * 0.6);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textBaseline = 'middle';
  
  const charWidth = props.width / props.length;
  
  for (let i = 0; i < captchaCode.value.length; i++) {
    const char = captchaCode.value[i];
    
    // 随机颜色
    ctx.fillStyle = getRandomColor(50, 160);
    
    // 随机位置和角度
    const x = charWidth * i + charWidth / 2;
    const y = props.height / 2 + Math.random() * 6 - 3;
    const angle = (Math.random() - 0.5) * 0.4;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
    ctx.restore();
  }
  
  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = getRandomColor(100, 200);
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * props.width, Math.random() * props.height);
    ctx.lineTo(Math.random() * props.width, Math.random() * props.height);
    ctx.stroke();
  }
  
  // 绘制干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = getRandomColor(100, 200);
    ctx.beginPath();
    ctx.arc(
      Math.random() * props.width,
      Math.random() * props.height,
      Math.random() * 2 + 1,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
  
  // 发送验证码值给父组件
  emit('change', captchaCode.value);
};

// 刷新验证码
const refreshCaptcha = () => {
  drawCaptcha();
};

// 验证验证码
const validate = (inputCode: string): boolean => {
  return inputCode.toUpperCase() === captchaCode.value.toUpperCase();
};

// 获取当前验证码值
const getValue = (): string => {
  return captchaCode.value;
};

// 暴露方法给父组件
defineExpose({
  refresh: refreshCaptcha,
  validate,
  getValue
});

// 组件挂载后绘制验证码
onMounted(() => {
  nextTick(() => {
    drawCaptcha();
  });
});
</script>

<style scoped>
.captcha-container {
  display: inline-block;
  position: relative;
}

.captcha-image {
  position: relative;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
}

.captcha-image:hover {
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
}

.captcha-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.refresh-hint {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;
}

.captcha-image:hover .refresh-hint {
  opacity: 1;
}

.refresh-hint i {
  font-size: 16px;
  margin-bottom: 2px;
}

.refresh-hint span {
  font-size: 10px;
}
</style>