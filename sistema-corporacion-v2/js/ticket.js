function openTicketPreview() {
    const proveedor = document.getElementById('proveedor')?.value || '-';
    const monto = document.getElementById('monto')?.value || '0.00';
    const fecha = document.getElementById('fecha')?.value || '-';
    const hora = document.getElementById('hora')?.value || '-';
    const metodo = document.getElementById('metodo')?.value || '-';
    const celular = document.getElementById('yapeCelular')?.value || '-';
    const destino = document.getElementById('yapeDestino')?.value || '-';
    const operacion = document.getElementById('yapeOperacion')?.value || '-';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ticket</title>
<style>
@page { size: 80mm auto; margin: 6mm; }
body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
.ticket { width: 68mm; margin: 0 auto; }
.title { text-align: center; font-weight: bold; margin-bottom: 8px; }
.row { display: flex; justify-content: space-between; margin: 4px 0; }
.label { color: #555; }
.value { font-weight: 600; }
.divider { border-top: 1px dashed #999; margin: 8px 0; }
</style>
</head>
<body>
  <div class="ticket">
    <div class="title">Zazu Express</div>
    <div class="row"><span class="label">Proveedor</span><span class="value">${proveedor}</span></div>
    <div class="row"><span class="label">Monto</span><span class="value">S/ ${monto}</span></div>
    <div class="row"><span class="label">Fecha</span><span class="value">${fecha}</span></div>
    <div class="row"><span class="label">Hora</span><span class="value">${hora}</span></div>
    <div class="row"><span class="label">Metodo</span><span class="value">${metodo}</span></div>
    <div class="row"><span class="label">Celular</span><span class="value">${celular}</span></div>
    <div class="row"><span class="label">Destino</span><span class="value">${destino}</span></div>
    <div class="row"><span class="label">Operacion</span><span class="value">${operacion}</span></div>
    <div class="divider"></div>
    <div class="row"><span class="label">Generado</span><span class="value">${new Date().toLocaleString('es-PE')}</span></div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('ticketPreviewBtn');
    if (btn) btn.addEventListener('click', openTicketPreview);
});
