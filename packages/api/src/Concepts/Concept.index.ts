import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concept } from "./Concept.entity";
import { ConceptResolver } from "./Concept.resolver";
import { ConceptService } from './Concept.service';
import { UserConcept } from "../UserConcepts/UserConcept.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Concept,UserConcept ])],
    providers:[ConceptResolver,ConceptService],
    exports:[ConceptService],
})
export class ConceptModule {}