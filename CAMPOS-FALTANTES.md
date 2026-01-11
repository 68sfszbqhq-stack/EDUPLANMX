# 📋 Campos Faltantes en el Formulario de Registro

## Comparación: Especificación vs Implementación Actual

### ✅ **I. Ficha de Identidad y Trayectoria Académica**
Todos los campos están implementados:
- ✅ CURP
- ✅ Nombre completo
- ✅ Género
- ✅ Promedio de secundaria
- ✅ Tipo de secundaria
- ✅ Sostenimiento (Público/Privado)

---

### ⚠️ **II. Estructura y Entorno Familiar**

#### ✅ Implementado:
- Tipo de familia (nuclear, monoparental, extensa, etc.)

#### ❌ FALTA:
1. **Red de Apoyo**:
   - Nombre del tutor responsable
   - Parentesco (padre, madre, hermano, tío, abuelo)

2. **Datos de Contacto**:
   - Teléfono del padre
   - Teléfono de la madre
   - Teléfono del tutor
   - Teléfono de emergencia

---

### ⚠️ **III. Capital Socioeconómico y Bienestar**

#### ✅ Implementado:
- Nivel educativo de los padres
- Ingresos mensuales familiares
- Servicios básicos (agua, luz, drenaje, internet, teléfono)
- Si el alumno trabaja
- Horas de trabajo semanal

#### ❌ FALTA:
3. **Ocupación de los Padres** (opciones específicas):
   - Hogar
   - Profesionista
   - Técnico
   - Obrero
   - Negocio propio
   - Comercio

4. **Situación Laboral del Alumno** (más específica):
   - Solo estudia
   - Estudia y trabaja
   - Trabaja y estudia

5. **Tipo de Vivienda**:
   - Propia
   - Rentada
   - Prestada

6. **Servicios Adicionales**:
   - TV por cable
   - Aire acondicionado

7. **Economía Familiar**:
   - Número de personas que aportan al ingreso

8. **Becas**:
   - Si cuenta con beca (Sí/No)
   - Tipo de beca (opcional)

9. **Salud**:
   - Institución de seguridad social (IMSS, ISSSTE, Bienestar, Ninguna)
   - Tratamiento de enfermedades crónicas (texto libre)

---

### ⚠️ **IV. Perfil de Intereses y Motivación**

#### ✅ Implementado:
- Materias preferidas
- Actividades de interés

#### ✅ TODO COMPLETO

---

### ⚠️ **V. Contexto Comunitario y Social (PAEC)**

#### ✅ Implementado:
- Problemas comunitarios (genéricos)

#### ❌ FALTA:
10. **Problemas Específicos del Entorno**:
    - Mala alimentación
    - Pandillerismo
    - Robos
    - (Además de los ya existentes: violencia, contaminación, adicciones, etc.)

11. **Deficiencias de Servicios en la Comunidad**:
    - Alumbrado público
    - Transporte público
    - Áreas verdes
    - Centros de salud
    - Rampas para discapacidad

12. **Factores de Riesgo Próximos** (Consumo de sustancias):
    - Alcohol en la cuadra
    - Tabaco en la cuadra
    - Drogas en la cuadra
    - Alcohol dentro de casa
    - Tabaco dentro de casa
    - Drogas dentro de casa

13. **Convivencia Social**:
    - Frecuencia de discusiones en la comunidad (Nunca, Rara vez, A veces, Frecuente, Muy frecuente)
    - Intensidad de peleas en la comunidad (Ninguna, Leve, Moderada, Grave)
    - Frecuencia de discusiones en la familia
    - Intensidad de peleas en la familia

14. **Cultura y Valores**:
    - Tradiciones locales identificadas (texto libre o checkboxes)
    - Festividades importantes

15. **Prácticas Discriminatorias Detectadas**:
    - Machismo
    - Homofobia
    - Racismo
    - Clasismo
    - Ninguna

---

## 📊 Resumen de Campos Faltantes

| Sección | Campos Implementados | Campos Faltantes | % Completado |
|---------|---------------------|------------------|--------------|
| I. Identidad | 6 | 0 | 100% |
| II. Familia | 1 | 2 | 33% |
| III. Socioeconómico | 6 | 7 | 46% |
| IV. Intereses | 2 | 0 | 100% |
| V. Comunidad (PAEC) | 1 | 6 | 14% |
| **TOTAL** | **16** | **15** | **52%** |

---

## 🎯 Prioridad de Implementación

### Alta Prioridad (Críticos para PAEC):
1. ✅ Problemas comunitarios específicos
2. ✅ Deficiencias de servicios
3. ✅ Consumo de sustancias (cuadra/casa)
4. ✅ Convivencia y violencia
5. ✅ Discriminación

### Media Prioridad (Importantes para diagnóstico):
6. ✅ Ocupación de los padres
7. ✅ Tipo de vivienda
8. ✅ Institución de salud
9. ✅ Becas
10. ✅ Datos de contacto

### Baja Prioridad (Complementarios):
11. ✅ Servicios adicionales (TV cable, AC)
12. ✅ Número de personas que aportan
13. ✅ Tradiciones culturales

---

## 🚀 Siguiente Paso

Voy a actualizar:
1. **`types/diagnostico.ts`** - Agregar todos los campos faltantes
2. **`components/FormularioAlumno.tsx`** - Expandir el formulario a 5 pasos
3. **Reorganizar pasos**:
   - Paso 1: Identidad y Trayectoria
   - Paso 2: Familia y Red de Apoyo
   - Paso 3: Economía y Salud
   - Paso 4: Comunidad y PAEC (Expandido)
   - Paso 5: Intereses y Motivación

¿Procedo con la actualización completa? 🚀
