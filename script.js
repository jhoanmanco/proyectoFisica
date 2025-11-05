const canvas = document.getElementById("forceTable");
const resultCanvas = document.getElementById("resultCanvas");

if (canvas && resultCanvas) {
  const ctx = canvas.getContext("2d");
  const rctx = resultCanvas.getContext("2d");
  const vectors = [];

  const magnitudeInput = document.getElementById("magnitude");
  const angleInput = document.getElementById("angle");
  const resultMag = document.getElementById("resultant");
  const resultAng = document.getElementById("resultantAngle");

    const tableBody = document.querySelector("#vectorTable tbody");

// Función para actualizar la tabla
function updateVectorTable() {
  tableBody.innerHTML = ""; // Limpiar tabla
  vectors.forEach((v, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>F${i + 1}</td>
      <td>${v.magnitude}</td>
      <td>${v.angle}</td>
      <td><button class="deleteBtn" data-index="${i}">Eliminar</button></td>
    `;
    tableBody.appendChild(row);
  });

  // Añadir evento a los botones de eliminar
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      vectors.splice(index, 1);
      drawCircularTable(ctx);
      drawVectors(ctx, vectors);
      updateVectorTable();
    });
  });
}

  // Dibujar la mesa circular
  function drawCircularTable(context) {
    const R = context.canvas.width / 2;
    const c = { x: R, y: R };
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Círculo base
    context.beginPath();
    context.arc(c.x, c.y, R - 10, 0, Math.PI * 2);
    context.strokeStyle = "#555";
    context.lineWidth = 2;
    context.stroke();

    // Ejes principales
    context.beginPath();
    context.moveTo(c.x, 0);
    context.lineTo(c.x, context.canvas.height);
    context.moveTo(0, c.y);
    context.lineTo(context.canvas.width, c.y);
    context.setLineDash([5, 3]);
    context.strokeStyle = "#1976d2";
    context.stroke();
    context.setLineDash([]);

    // Marcas de grados
    context.font = "10px Segoe UI";
    context.fillStyle = "#444";
    for (let i = 0; i < 360; i += 10) {
      const rad = (i * Math.PI) / 180;
      const x1 = c.x + (R - 20) * Math.cos(rad);
      const y1 = c.y - (R - 20) * Math.sin(rad);
      const x2 = c.x + (R - 10) * Math.cos(rad);
      const y2 = c.y - (R - 10) * Math.sin(rad);
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = "#ccc";
      context.stroke();

      if (i % 30 === 0) {
        const tx = c.x + (R - 35) * Math.cos(rad);
        const ty = c.y - (R - 35) * Math.sin(rad);
        context.fillText(i.toString(), tx - 8, ty + 3);
      }
    }
  }

  // Dibuja vectores desde el centro
  function drawVectors(context, list) {
  const c = { x: context.canvas.width / 2, y: context.canvas.height / 2 };
  list.forEach((v, i) => {
    const endX = c.x + v.magnitude * Math.cos(v.angle * Math.PI / 180);
    const endY = c.y - v.magnitude * Math.sin(v.angle * Math.PI / 180);

    // Vector
    context.beginPath();
    context.moveTo(c.x, c.y);
    context.lineTo(endX, endY);
    context.strokeStyle = v.color;
    context.lineWidth = 2;
    context.stroke();

    // Flecha
    const a = v.angle * Math.PI / 180;
    const arrowSize = 8;
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(endX - arrowSize * Math.cos(a - 0.3), endY + arrowSize * Math.sin(a - 0.3));
    context.lineTo(endX - arrowSize * Math.cos(a + 0.3), endY + arrowSize * Math.sin(a + 0.3));
    context.closePath();
    context.fillStyle = v.color;
    context.fill();

    // Texto con F#, magnitud y ángulo
    context.font = "bold 12px Segoe UI";
    context.fillStyle = "#000";
    context.fillText(`F${i + 1} ${v.magnitude} g ${v.angle}°`, endX + 5, endY);
  });
}


  // Dibuja el diagrama cabeza-cola
  function drawHeadToTail(context, list) {
  const c = { x: context.canvas.width / 2, y: context.canvas.height / 2 };
  let start = { ...c };

  list.forEach((v, i) => {
    const endX = start.x + v.magnitude * Math.cos(v.angle * Math.PI / 180);
    const endY = start.y - v.magnitude * Math.sin(v.angle * Math.PI / 180);

    // Componentes punteadas
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(endX, start.y);
    context.strokeStyle = "rgba(0,0,0,0.3)";
    context.stroke();

    context.beginPath();
    context.moveTo(endX, start.y);
    context.lineTo(endX, endY);
    context.stroke();

    context.setLineDash([]);

    // Vector
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(endX, endY);
    context.strokeStyle = v.color;
    context.lineWidth = 2;
    context.stroke();

    // Flecha
    const a = v.angle * Math.PI / 180;
    const arrowSize = 8;
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(endX - arrowSize * Math.cos(a - 0.3), endY + arrowSize * Math.sin(a - 0.3));
    context.lineTo(endX - arrowSize * Math.cos(a + 0.3), endY + arrowSize * Math.sin(a + 0.3));
    context.closePath();
    context.fillStyle = v.color;
    context.fill();

    context.font = "bold 12px Segoe UI";
    context.fillStyle = "#000";
    context.fillText(`F${i + 1} ${v.magnitude} g ${v.angle}°`, endX + 5, endY);
    start = { x: endX, y: endY };
  });

  // Dibujar resultante desde el centro
  const { resultant, angle } = calculateResultant(list);
  const endX = c.x + resultant * Math.cos(angle * Math.PI / 180);
  const endY = c.y - resultant * Math.sin(angle * Math.PI / 180);
  context.beginPath();
  context.moveTo(c.x, c.y);
  context.lineTo(endX, endY);
  context.strokeStyle = "red";
  context.lineWidth = 2.5;
  context.stroke();
  context.fillStyle = "red";


  // --- NUEVO: marcador del ángulo en la circunferencia ---
  const R = context.canvas.width / 2 - 10; // radio de la rueda
  const rad = angle * Math.PI / 180;
  const mx = c.x + R * Math.cos(rad);
  const my = c.y - R * Math.sin(rad);

  context.beginPath();
  context.arc(mx, my, 5, 0, Math.PI * 2); // puntito rojo
  context.fillStyle = "red";
  context.fill();

  context.font = "bold 12px Segoe UI";
  context.fillText(`${angle.toFixed(1)}°`, mx + 8, my - 5); // ángulo en rojo
}


  function calculateResultant(list = vectors) {
    let sumX = 0, sumY = 0;
    list.forEach(v => {
      sumX += v.magnitude * Math.cos(v.angle * Math.PI / 180);
      sumY += v.magnitude * Math.sin(v.angle * Math.PI / 180);
    });
    const resultant = Math.sqrt(sumX ** 2 + sumY ** 2);
    const angle = Math.atan2(sumY, sumX) * 180 / Math.PI;
    resultMag.textContent = `${resultant.toFixed(2)} g`;
    resultAng.textContent = `${angle.toFixed(2)}°`;
    return { resultant, angle };
  }

  // Eventos
  document.getElementById("addVector").addEventListener("click", () => {
    const magnitude = parseFloat(magnitudeInput.value);
    const angle = parseFloat(angleInput.value);
    const color = `hsl(${Math.random() * 360}, 80%, 45%)`;
    vectors.push({ magnitude, angle, color });
    drawCircularTable(ctx);
    drawVectors(ctx, vectors);
    updateVectorTable(); // Actualiza la tabla

  });

  document.getElementById("clearVectors").addEventListener("click", () => {
    vectors.length = 0;
    drawCircularTable(ctx);
    drawCircularTable(rctx);
    resultCanvas.style.display = "none";
    resultMag.textContent = "0 g";
    resultAng.textContent = "0°";
    updateVectorTable(); // Limpiar tabla también

  });

  document.getElementById("showResult").addEventListener("click", () => {
    if (vectors.length === 0) return alert("Agrega al menos un vector primero.");
    resultCanvas.style.display = "block";
    drawCircularTable(rctx);
    drawHeadToTail(rctx, vectors);
  });

  drawCircularTable(ctx);
}
