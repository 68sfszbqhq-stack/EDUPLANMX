
import { MCCEMS_DOCUMENTS } from '../data/mccemsData';
import { MCCEMSMetadata } from '../types';

export const getDocumentById = (id: string): MCCEMSMetadata | undefined => {
  return MCCEMS_DOCUMENTS.find(doc => doc.id === id);
};

export const getDocumentsByCategory = (category: string): MCCEMSMetadata[] => {
  return MCCEMS_DOCUMENTS.filter(doc => doc.category === category);
};

export const getMCCEMSContextString = (subjectId: string): string => {
  const doc = getDocumentById(subjectId);
  if (!doc) return "Documento base del MCCEMS y NEM.";
  return `Este plan debe alinearse estrictamente a las progresiones de aprendizaje del documento oficial de la SEP: ${doc.name} (${doc.url}).`;
};
