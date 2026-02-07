import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeScreen } from './WelcomeScreen';
import { JoinSchoolScreen } from './JoinSchoolScreen';
import { CreateSchoolScreen } from './CreateSchoolScreen';
import { CompleteProfileScreen } from './CompleteProfileScreen';
import { schoolService } from '../../src/services/schoolService';
import { auth } from '../../src/config/firebase';
import type { Puesto, CompleteProfileData } from '../../types/school';

type OnboardingStep =
    | 'welcome'
    | 'join-school'
    | 'create-school'
    | 'complete-profile';

interface OnboardingState {
    schoolId?: string;
    schoolName?: string;
    puesto?: Puesto;
}

export const OnboardingContainer: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
    const [state, setState] = useState<OnboardingState>({});
    const [error, setError] = useState('');

    const user = auth.currentUser;
    const userName = user?.displayName?.split(' ')[0] || 'Usuario';

    // Paso 1: Bienvenida - Elegir unirse o crear
    const handleWelcomeChoice = (choice: 'join' | 'create') => {
        if (choice === 'join') {
            setCurrentStep('join-school');
        } else {
            setCurrentStep('create-school');
        }
    };

    // Paso 2a: Escuela seleccionada (unirse)
    const handleSchoolSelected = (schoolId: string, schoolName: string) => {
        setState({
            schoolId,
            schoolName,
            puesto: 'Docente' // Default, se puede cambiar en el perfil
        });
        setCurrentStep('complete-profile');
    };

    // Paso 2b: Escuela creada
    const handleSchoolCreated = (schoolId: string, schoolName: string, puesto: Puesto) => {
        setState({
            schoolId,
            schoolName,
            puesto
        });
        setCurrentStep('complete-profile');
    };

    // Paso 3: Completar perfil y finalizar
    const handleProfileComplete = async (profileData: CompleteProfileData) => {
        try {
            if (!user || !state.schoolId || !state.schoolName) {
                throw new Error('Información incompleta');
            }

            // Extraer nombre y apellido del displayName
            const fullName = user.displayName || '';
            const nameParts = fullName.split(' ');
            const nombre = nameParts[0] || 'Usuario';
            const apellidoPaterno = nameParts[1] || '';

            // Crear perfil de usuario en Firestore
            await schoolService.createUserProfile(
                user.uid,
                user.email || '',
                nombre,
                apellidoPaterno,
                state.schoolId,
                state.schoolName,
                profileData
            );

            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Error al completar onboarding:', err);
            setError(err.message || 'Error al guardar el perfil');
        }
    };

    // Volver atrás
    const handleBack = () => {
        if (currentStep === 'join-school' || currentStep === 'create-school') {
            setCurrentStep('welcome');
        } else if (currentStep === 'complete-profile') {
            // Volver al paso anterior según de dónde vino
            setCurrentStep('welcome');
            setState({});
        }
    };

    // Renderizar paso actual
    return (
        <>
            {error && (
                <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-lg z-50">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {currentStep === 'welcome' && (
                <WelcomeScreen
                    userName={userName}
                    onChoice={handleWelcomeChoice}
                    onSchoolSelected={handleSchoolSelected}
                />
            )}

            {currentStep === 'join-school' && (
                <JoinSchoolScreen
                    onBack={handleBack}
                    onSchoolSelected={handleSchoolSelected}
                />
            )}

            {currentStep === 'create-school' && (
                <CreateSchoolScreen
                    onBack={handleBack}
                    onSchoolCreated={handleSchoolCreated}
                />
            )}

            {currentStep === 'complete-profile' && state.schoolName && state.puesto && (
                <CompleteProfileScreen
                    schoolName={state.schoolName}
                    puesto={state.puesto}
                    onComplete={handleProfileComplete}
                />
            )}
        </>
    );
};
