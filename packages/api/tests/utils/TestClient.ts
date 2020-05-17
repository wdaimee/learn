import { Test, TestingModule } from '@nestjs/testing';
import 'jest-extended';
import request from 'supertest';

import { appImports } from '../../src/App.module';
import { DatabaseService } from '../../src/Database/Database.service';
import { SeederService } from '../../src/Database/seeders/Seeders.service';
import mutations from './mutations';
import queries from './queries';
import { TestLogger } from './TestLogger.service';
import { UserPreferencesInput, UserPreferences } from '../../src/UserPreferences/UserPreferences.entity';
import { UpdateModuleInput } from '../../src/Module/Module.entity';
import { randomUserInput } from '../../src/Database/seeders/random';
import { UserInput, User, LoginOutput, Path, PathInput, CreateFriendInput, FriendOutput, Friend, Module, ModuleInput, CharacterCreateInput, CharacterUpdateInput, Character, CharacterIndex } from '../../types';


/**
 * A helper class to test the API
 */
export abstract class TestClient {
  static db: DatabaseService;

  static seeder: SeederService;

  static app: any;

  static token: string;


  /**
   * Reset the entire database
   */
  static async resetDatabase() {
    await this.db.DANGEROUSLY_RESET_DATABASE();
  }

  /**
   * Starts a testing NestJS server
   * @param resetDatabase Reset the database
   */
  static async start(resetDatabase = true) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: appImports,
      providers: [TestLogger],
      exports: [TestLogger]
    }).compile();

    this.db = await moduleFixture.resolve(DatabaseService);
    this.seeder = await moduleFixture.get(SeederService);
    if (resetDatabase) await this.resetDatabase();


    this.app = moduleFixture.createNestApplication();
    this.app.useLogger(this.app.get(TestLogger));
    await this.app.init();
  }

  /**
   * Stops the NestJS testing server
   */
  static async stop() {
    await this.app.close();
  }


  // ----------------------------------------------------------------- Mutations
  static createUser(user: UserInput = randomUserInput()): Promise<User> {
    return this._request('createUser', mutations.createUser, { user });
  }

  static async login(email: string, password: string, storeToken = true): Promise<LoginOutput> {
    const res = await this._request<LoginOutput>('login', mutations.login, { email, password });
    if (storeToken) this.token = res.accessToken;
    return res;
  }

  static createPath(path: PathInput, character: CharacterCreateInput): Promise<Path> {
    return this._request('createPath', mutations.createPath, { path, character });
  }

  static joinPath(pathId: string): Promise<Boolean> {
    return this._request('joinPath', mutations.joinPath, { pathId });
  }

  static updatePreferences(preferences: UserPreferencesInput): Promise<UserPreferences> {
    return this._request('updatePreferences', mutations.updatePreferences, { preferences });
  }

  static createFriendship(friendInput: CreateFriendInput): Promise<FriendOutput> {
    return this._request('createFriendship', mutations.createFriendship, { friendInput });
  }

  static respondToFriendRequest(
    user1Id: string,
    user2Id: string,
    response: string
  ): Promise<Friend> {
    return this._request('respondToFriendRequest', mutations.respondToFriendRequest, { user1Id, user2Id, response });
  }

  static deleteFriendship(friendId: string): Promise<Boolean> {
    return this._request('deleteFriendship', mutations.deleteFriendship, { friendId });
  }

  static createModule(module: ModuleInput): Promise<Module> {
    return this._request('createModule', mutations.createModule, { module });
  }

  static updateModule(update: UpdateModuleInput): Promise<Module> {
    return this._request('updateModule', mutations.updateModule, { update });
  }

  static deleteModule(moduleId: string): Promise<Module> {
    return this._request('deleteModule', mutations.deleteModule, { moduleId });
  }

  static createCharacter(character: CharacterCreateInput): Promise<Character> {
    return this._request('createCharacter', mutations.createCharacter, { character });
  }

  static updateCharacter(index: CharacterIndex, update: CharacterUpdateInput): Promise<Boolean> {
    return this._request('updateCharacter', mutations.updateCharacter, { index, update });
  }
  // ------------------------------------------------------------------- Queries

  static getPathByName(name: string): Promise<Path> {
    return this._request('getPathByName', queries.getPathByName, { name });
  }

  static me(): Promise<User> {
    return this._request('me', queries.me);
  }

  static getUserFriends(userId: string): Promise< Friend[] > {
    return this._request('getUserFriends', queries.getUserFriends, { userId });
  }

  static characters(): Promise<Character[]> {
    return this._request('characters', queries.characters);
  }

  static getCharacter(index: CharacterIndex): Promise<Character> {
    return this._request('getCharacter', queries.getCharacter, { index });
  }

  // ----------------------------------------------------------------- Workflows
  static async workflowSignup() {
    const userInput = randomUserInput();
    const user = await this.createUser(userInput);
    const { accessToken } = await this.login(user.email, userInput.password);
    return { password: userInput.password, user, accessToken };
  }

  // ----------------------------------------------------------------- Private
  /**
   * Queries the local API and returns result
   * @param name Name of query
   * @param query GQL Query or mutation to run
   * @param variables Variables to pass if needed
   */
  private static async _request<T>(name: string, query: string, variables?: any): Promise<T> {

    const res = await request(this.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${this.token}`)
      .send({ query, variables });

    if (res.body.errors) throw new Error(res.body.errors[0].message);
    return res.body.data[name];
  }
}
