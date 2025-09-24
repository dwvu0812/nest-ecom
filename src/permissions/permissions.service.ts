import { Injectable } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PermissionRepository } from './repositories/permission.repository';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResourceException } from '../shared/exceptions';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAllActive();
  }

  async findById(id: number): Promise<Permission | null> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission || permission.deletedAt) {
      return null;
    }

    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, description, path, method, createdById } =
      createPermissionDto;

    // Check if permission with same name and method already exists
    const existingByName =
      await this.permissionRepository.existsByNameAndMethod(name, method);
    if (existingByName) {
      throw ResourceException.alreadyExists(
        `Permission with name '${name}' and method '${method}' already exists`,
      );
    }

    // Check if permission with same path and method already exists
    const existingByPath =
      await this.permissionRepository.existsByPathAndMethod(path, method);
    if (existingByPath) {
      throw ResourceException.alreadyExists(
        `Permission with path '${path}' and method '${method}' already exists`,
      );
    }

    const createData: any = {
      name,
      description,
      path,
      method,
    };

    if (createdById) {
      createData.createdById = createdById;
      createData.updatedById = createdById;
    }

    return this.permissionRepository.create(createData);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const { name, description, path, method, updatedById } =
      updatePermissionDto;

    // Check if permission exists
    const existingPermission = await this.findById(id);
    if (!existingPermission) {
      throw ResourceException.notFound('Permission not found');
    }

    // Check if name and method combination already exists for another permission
    if (name && method) {
      const existingByName =
        await this.permissionRepository.existsByNameAndMethod(name, method, id);
      if (existingByName) {
        throw ResourceException.alreadyExists(
          `Permission with name '${name}' and method '${method}' already exists`,
        );
      }
    } else if (name) {
      // Use existing method if not provided
      const existingByName =
        await this.permissionRepository.existsByNameAndMethod(
          name,
          existingPermission.method,
          id,
        );
      if (existingByName) {
        throw ResourceException.alreadyExists(
          `Permission with name '${name}' and method '${existingPermission.method}' already exists`,
        );
      }
    } else if (method) {
      // Use existing name if not provided
      const existingByName =
        await this.permissionRepository.existsByNameAndMethod(
          existingPermission.name,
          method,
          id,
        );
      if (existingByName) {
        throw ResourceException.alreadyExists(
          `Permission with name '${existingPermission.name}' and method '${method}' already exists`,
        );
      }
    }

    // Check if path and method combination already exists for another permission
    if (path && method) {
      const existingByPath =
        await this.permissionRepository.existsByPathAndMethod(path, method, id);
      if (existingByPath) {
        throw ResourceException.alreadyExists(
          `Permission with path '${path}' and method '${method}' already exists`,
        );
      }
    } else if (path) {
      // Use existing method if not provided
      const existingByPath =
        await this.permissionRepository.existsByPathAndMethod(
          path,
          existingPermission.method,
          id,
        );
      if (existingByPath) {
        throw ResourceException.alreadyExists(
          `Permission with path '${path}' and method '${existingPermission.method}' already exists`,
        );
      }
    } else if (method) {
      // Use existing path if not provided
      const existingByPath =
        await this.permissionRepository.existsByPathAndMethod(
          existingPermission.path,
          method,
          id,
        );
      if (existingByPath) {
        throw ResourceException.alreadyExists(
          `Permission with path '${existingPermission.path}' and method '${method}' already exists`,
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (path !== undefined) updateData.path = path;
    if (method !== undefined) updateData.method = method;
    if (updatedById !== undefined) updateData.updatedById = updatedById;

    return this.permissionRepository.update({ id }, updateData);
  }

  async remove(id: number, deletedBy?: number): Promise<Permission> {
    // Check if permission exists
    const existingPermission = await this.findById(id);
    if (!existingPermission) {
      throw ResourceException.notFound('Permission not found');
    }

    return this.permissionRepository.softDelete({ id }, deletedBy);
  }
}
