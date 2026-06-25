import { createConnection } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { databaseConfig } from '../config/database.config';

async function seed() {
  const config = databaseConfig() as any;
  const connection = await createConnection({ ...config, name: 'seed' });

  const queryRunner = connection.createQueryRunner();

  try {
    const permissions = [
      { name: 'create_user', description: 'Create new users' },
      { name: 'delete_user', description: 'Delete users' },
      { name: 'view_users', description: 'View users' },
      { name: 'edit_user', description: 'Edit users' },
      { name: 'deactivate_user', description: 'Deactivate users' },
      { name: 'view_audit_logs', description: 'View audit logs' },
      { name: 'manage_roles', description: 'Manage roles' },
      { name: 'manage_permissions', description: 'Manage permissions' },
      { name: 'view_roles', description: 'View roles' },
      { name: 'view_permissions', description: 'View permissions' },
      { name: 'manage_sessions', description: 'Manage sessions' },
      { name: 'export_logs', description: 'Export audit logs' },
      { name: 'view_reports', description: 'View reports' },
    ];

    const roles = [
      { name: 'Super Admin', description: 'Full system access' },
      { name: 'Admin', description: 'Administrative access' },
      { name: 'User', description: 'Basic user access' },
      { name: 'Auditor', description: 'Read-only audit access' },
    ];

    await queryRunner.startTransaction();

    const insertedPermissions: Record<string, string> = {};
    for (const perm of permissions) {
      const existing = await queryRunner.query(
        `SELECT id FROM permissions WHERE name = $1`, [perm.name],
      );
      if (existing.length > 0) {
        insertedPermissions[perm.name] = existing[0].id;
      } else {
        const id = uuidv4();
        await queryRunner.query(
          `INSERT INTO permissions (id, name, description) VALUES ($1, $2, $3)`,
          [id, perm.name, perm.description],
        );
        insertedPermissions[perm.name] = id;
      }
    }

    const insertedRoles: Record<string, string> = {};
    for (const role of roles) {
      const existing = await queryRunner.query(
        `SELECT id FROM roles WHERE name = $1`, [role.name],
      );
      if (existing.length > 0) {
        insertedRoles[role.name] = existing[0].id;
      } else {
        const id = uuidv4();
        await queryRunner.query(
          `INSERT INTO roles (id, name, description) VALUES ($1, $2, $3)`,
          [id, role.name, role.description],
        );
        insertedRoles[role.name] = id;
      }
    }

    const rolePermissionMap: Record<string, string[]> = {
      'Super Admin': Object.values(insertedPermissions),
      'Admin': ['create_user', 'view_users', 'edit_user', 'deactivate_user', 'manage_sessions']
        .map(n => insertedPermissions[n]).filter(Boolean),
      'User': [],
      'Auditor': ['view_audit_logs', 'view_reports', 'export_logs']
        .map(n => insertedPermissions[n]).filter(Boolean),
    };

    for (const [roleName, permIds] of Object.entries(rolePermissionMap)) {
      const roleId = insertedRoles[roleName];
      const existingRPs = await queryRunner.query(
        `SELECT permission_id FROM role_permissions WHERE role_id = $1`, [roleId],
      );
      const existingPermIds = existingRPs.map((r: any) => r.permission_id);

      for (const permId of permIds) {
        if (!existingPermIds.includes(permId)) {
          await queryRunner.query(
            `INSERT INTO role_permissions (id, role_id, permission_id) VALUES ($1, $2, $3)`,
            [uuidv4(), roleId, permId],
          );
        }
      }
    }

    const passwordHash = await bcrypt.hash('Admin@123', 12);

    const superAdminEmail = 'admin@securevault.io';
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`, [superAdminEmail],
    );

    if (existingAdmin.length === 0) {
      await queryRunner.query(
        `INSERT INTO users (id, fullname, email, password_hash, role_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())`,
        [uuidv4(), 'Super Admin', superAdminEmail, passwordHash, insertedRoles['Super Admin']],
      );
      console.log('Default admin created: admin@securevault.io / Admin@123');
    } else {
      console.log('Admin user already exists, skipping.');
    }

    await queryRunner.commitTransaction();
    console.log('Seed completed successfully!');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('Seed failed:', err);
  } finally {
    await queryRunner.release();
    await connection.close();
  }
}

seed();
