// 🔐 Script para crear el primer usuario Super Admin
// Ejecutar con: npx tsx crear-super-admin.ts

import { authService } from './src/services/authService';
import type { RegisterData } from './types/auth';

async function crearSuperAdmin() {
    console.log('🔐 Creando Super Administrador inicial...\n');

    const superAdminData: RegisterData = {
        email: 'admin@eduplanmx.com',
        password: 'Admin123!',
        nombre: 'Super',
        apellidoPaterno: 'Administrador',
        apellidoMaterno: 'Sistema',
        rol: 'superadmin'
    };

    try {
        console.log('📧 Email:', superAdminData.email);
        console.log('🔑 Password:', superAdminData.password);
        console.log('👤 Nombre:', `${superAdminData.nombre} ${superAdminData.apellidoPaterno} ${superAdminData.apellidoMaterno}`);
        console.log('🎭 Rol:', superAdminData.rol);
        console.log('');

        const usuario = await authService.register(superAdminData, 'system');

        console.log('✅ Super Administrador creado exitosamente!\n');
        console.log('📊 Datos del usuario:');
        console.log('   ID:', usuario.id);
        console.log('   Email:', usuario.email);
        console.log('   Nombre:', `${usuario.nombre} ${usuario.apellidoPaterno}`);
        console.log('   Rol:', usuario.rol);
        console.log('');
        console.log('🔐 CREDENCIALES DE ACCESO:');
        console.log('   Email: admin@eduplanmx.com');
        console.log('   Password: Admin123!');
        console.log('');
        console.log('🌐 Ahora puedes iniciar sesión en:');
        console.log('   Local: http://localhost:5173/login');
        console.log('   Producción: https://68sfszbqhq-stack.github.io/EDUPLANMX/login');
        console.log('');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');

    } catch (error: any) {
        console.error('\n❌ Error al crear Super Administrador:', error.message);

        if (error.message.includes('email-already-in-use')) {
            console.log('\n💡 El usuario ya existe. Puedes iniciar sesión con:');
            console.log('   Email: admin@eduplanmx.com');
            console.log('   Password: Admin123!');
        }
    }
}

// Ejecutar
crearSuperAdmin()
    .then(() => {
        console.log('\n✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
