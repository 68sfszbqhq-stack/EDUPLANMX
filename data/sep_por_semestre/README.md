# Programas MCCEMS por Semestre

Este directorio contiene los programas oficiales de la DGB/SEP organizados por semestre.

## Estructura

```
semestre1.json - 8 materias del primer semestre
semestre2.json - 7 materias del segundo semestre  
semestre3.json - 7 materias del tercer semestre
semestre4.json - Materias del cuarto semestre
semestre5.json - Materias del quinto semestre
semestre6.json - Materias del sexto semestre
```

## Uso

El servicio `programasSEPService.ts` carga todos estos archivos y los consolida en un solo catálogo.

## Actualización

Para actualizar el contenido:
1. Edita el archivo JSON del semestre correspondiente
2. El servicio recargará automáticamente los cambios

## Fuente Oficial

https://dgb.sep.gob.mx/marco-curricular
