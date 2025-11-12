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

  // Dibujar la mesa circular (MODIFICADO: Menor radio para el círculo)
  function drawCircularTable(context) {
    const R_canvas = context.canvas.width / 2; // Radio total del canvas
    const R_table = R_canvas * 0.6;
    const c = { x: R_canvas, y: R_canvas };
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Círculo base
    context.beginPath();
    context.arc(c.x, c.y, R_table - 10, 0, Math.PI * 2); // Usa R_table
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
      const x1 = c.x + (R_table - 20) * Math.cos(rad); // Usa R_table
      const y1 = c.y - (R_table - 20) * Math.sin(rad); // Usa R_table
      const x2 = c.x + (R_table - 10) * Math.cos(rad); // Usa R_table
      const y2 = c.y - (R_table - 10) * Math.sin(rad); // Usa R_table
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = "#ccc";
      context.stroke();

      if (i % 30 === 0) {
        const tx = c.x + (R_table - 35) * Math.cos(rad); // Usa R_table
        const ty = c.y - (R_table - 35) * Math.sin(rad); // Usa R_table
        context.fillText(i.toString(), tx - 8, ty + 3);
      }
    }
  }

  // Función de escalado (MODIFICADO: Acepta magnitud resultante)
  function getScaleFactor(context, list, resultantMag = 0) {
    if (list.length === 0 && resultantMag === 0) return 1;
    // Radio de visualización efectivo. 0.7 asegura un buen margen.
    const R = context.canvas.width / 2 * 0.7; // 
    
    const allMags = list.map(v => v.magnitude);
    if (resultantMag > 0) {
      // Incluye la magnitud de la resultante para que la escala sea apropiada
      allMags.push(resultantMag);
    }
    
    const maxMag = allMags.length > 0 ? Math.max(...allMags) : 0;

    return maxMag > 0 ? R / maxMag : 1;
  }


  // Dibuja vectores desde el centro
  function drawVectors(context, list) {
    const c = { x: context.canvas.width / 2, y: context.canvas.height / 2 };
    const scale = getScaleFactor(context, list); // No se pasa resultantMag aquí

    list.forEach((v, i) => {
      const endX = c.x + (v.magnitude * scale) * Math.cos(v.angle * Math.PI / 180);
      const endY = c.y - (v.magnitude * scale) * Math.sin(v.angle * Math.PI / 180);

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

      // Texto
      context.font = "bold 12px Segoe UI";
      context.fillStyle = "#000";
      context.fillText(`F${i + 1} ${v.magnitude} N ${v.angle}°`, endX + 5, endY);
    });
  }


// Dibuja el diagrama cabeza-cola
  function drawHeadToTail(context, list) {
    const c = { x: context.canvas.width / 2, y: context.canvas.height / 2 };
    
    // 1. Calcular la resultante primero
    const { resultant, angle } = calculateResultant(list);
    
    // 2. Calcular la escala que se ajusta a todos los vectores Y la resultante
    const scale = getScaleFactor(context, list, resultant);
    
    let start = { ...c };

    list.forEach((v, i) => {
      const endX = start.x + (v.magnitude * scale) * Math.cos(v.angle * Math.PI / 180);
      const endY = start.y - (v.magnitude * scale) * Math.sin(v.angle * Math.PI / 180);

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
      context.fillText(`F${i + 1} ${v.magnitude} N ${v.angle}°`, endX + 5, endY);
      start = { x: endX, y: endY };
    });

    // Resultante
    const endX = c.x + (resultant * scale) * Math.cos(angle * Math.PI / 180);
    const endY = c.y - (resultant * scale) * Math.sin(angle * Math.PI / 180);

    context.beginPath();
    context.moveTo(c.x, c.y);
    context.lineTo(endX, endY);
    context.strokeStyle = "red";
    context.lineWidth = 2.5;
    context.stroke();

    // Marcador del ángulo (MODIFICADO para estar ligeramente alejado de la punta del vector resultante)
    const markerOffsetDistance = 20; // Distancia para alejar el marcador
    const markerRad = angle * Math.PI / 180; // Ángulo de la resultante en radianes

    const mx = endX + markerOffsetDistance * Math.cos(markerRad); 
    const my = endY - markerOffsetDistance * Math.sin(markerRad); // Nota: 'my' se resta para la coordenada Y en canvas
    
    context.beginPath();
    context.arc(mx, my, 5, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    
    // Pequeño desplazamiento para el texto, para que no cubra el punto
    const textOffset = 8; 

    context.font = "bold 12px Segoe UI";
    context.fillText(`${angle.toFixed(1)}°`, mx + textOffset, my - 5);
  }



  function calculateResultant(list = vectors) {
    let sumX = 0, sumY = 0;
    list.forEach(v => {
      sumX += v.magnitude * Math.cos(v.angle * Math.PI / 180);
      sumY += v.magnitude * Math.sin(v.angle * Math.PI / 180);
    });

    const resultant = Math.sqrt(sumX ** 2 + sumY ** 2);
    let angle = Math.atan2(sumY, sumX) * 180 / Math.PI;

    // Convertir ángulo negativo a positivo (0°–360°)
    if (angle < 0) angle += 360;

    resultMag.textContent = `${resultant.toFixed(2)} N`;
    resultAng.textContent = `${angle.toFixed(2)}°`;

    return { resultant, angle };
  }

  // Eventos
  document.getElementById("addVector").addEventListener("click", () => {
    const magnitude = parseFloat(magnitudeInput.value);
    const angle = parseFloat(angleInput.value);
    const color = `hsl(${Math.random() * 360}, 80%, 45%)`;
    if (isNaN(magnitude) || isNaN(angle)) return alert("Por favor, introduce valores válidos.");
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
    resultMag.textContent = "0 N";
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