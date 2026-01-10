# OCR Demo (sin conexion)

Este documento describe como seria un endpoint OCR en backend sin conectarlo aun.

## Endpoint propuesto

POST /api/ocr/receipt

### Request

- Content-Type: multipart/form-data
- file: imagen del comprobante (jpg/png)
- metadata (opcional):
  - zona: lima | provincia
  - metodo: yape | plin | transferencia

### Response (JSON)

{
  "ok": true,
  "fields": {
    "monto": "75.00",
    "fecha": "2025-12-31",
    "hora": "21:16",
    "destinatario": "Jessica Roj*",
    "numero": "988096051",
    "operacion": "31932156",
    "seguridad": "156",
    "destino": "Yape",
    "moneda": "PEN"
  },
  "confidence": {
    "monto": 0.98,
    "fecha": 0.9,
    "hora": 0.87,
    "destinatario": 0.8,
    "operacion": 0.92
  },
  "raw_text": "Texto completo extraido (opcional)"
}

## Parser propuesto (regex basico)

- monto: buscar patron "S/\\s*\\d+[\\.,]\\d{2}"
- fecha: buscar formato "dd mm yyyy" o "dd/mm/yyyy"
- hora: buscar "hh:mm" con am/pm opcional
- operacion: buscar "Nro. de operacion" + numeros
- seguridad: buscar "Codigo de seguridad" + numeros
- destinatario: linea posterior a "¡Yapeaste!" u "Operacion"

## Notas

- Este demo no ejecuta OCR real.
- Cuando se conecte, el backend ejecuta OCR, parsea y devuelve fields.
