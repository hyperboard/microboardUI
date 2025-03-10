const fpsCounter = document.createElement("div");
fpsCounter.id = "fpsCounter";
fpsCounter.style.position = "fixed";
fpsCounter.style.top = "10px";
fpsCounter.style.right = "10px";
fpsCounter.style.fontFamily = "Arial, sans-serif";
fpsCounter.style.fontSize = "14px";
fpsCounter.style.color = "white";
fpsCounter.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
fpsCounter.style.padding = "5px 10px";
fpsCounter.style.zIndex = "9999";
document.body.appendChild(fpsCounter);

let fps = 0;
let frameCount = 0;
let lastTime = performance.now();

export function updateFPS(): void {
	const currentTime = performance.now();
	const deltaTime = currentTime - lastTime;
	frameCount++;

	if (deltaTime >= 1000) {
		fps = Math.round((frameCount * 1000) / deltaTime);
		frameCount = 0;
		lastTime = currentTime;
	}

	fpsCounter.textContent = `FPS: ${fps}`;

	requestAnimationFrame(updateFPS);
}
