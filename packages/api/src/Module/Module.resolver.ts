import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GQLAuthGuard } from '../Auth/GQLAuth.guard';
import { Module, CreateModuleInput, UpdateModuleInput } from './Module.entity';
import { ModuleService } from './Module.service';

@Resolver(() => Module)
export class ModuleResolver {
  constructor(private readonly moduleService: ModuleService) {}

  @UseGuards(GQLAuthGuard)
  @Query(() => [Module])
  modules() {
    return this.moduleService.findAll();
  }

  @UseGuards(GQLAuthGuard)
  @Query(() => [Module])
  pathModules(@Args('pathId') pathId: string) {
    return this.moduleService.findByPath(pathId);
  }

  @UseGuards(GQLAuthGuard)
  @Mutation(() => Module)
  createModule(
    @Args('module') module: CreateModuleInput
  ) {
    return this.moduleService.create(module);
  }

  @UseGuards(GQLAuthGuard)
  @Mutation(() => Module)
  updateModule(
    @Args('module') module: UpdateModuleInput
  ) {
    return this.moduleService.update(module);
  }

  @UseGuards(GQLAuthGuard)
  @Mutation(() => Boolean)
  deleteModule(
    @Args('moduleId') moduleId: string
  ) {
    return this.moduleService.delete(moduleId);
  }

}
