import { PlayerLocation } from "../../enum/GameEnum";
import { MatchResultData, ObjectData, OnSceneData, RenderData } from "../../gameData";
import { GameManager } from "../../simul/GameManager";
import * as Box2D from "../../Box2D";
export class GameDataMaker {
  public makeOnSceneData(
    gameManager : GameManager,
    sid : string
  ) : OnSceneData {
    const matchStartData : OnSceneData = new OnSceneData();

    matchStartData.gameId = gameManager.gameId;
    matchStartData.playerLocation = gameManager.player1.sid == sid ? PlayerLocation.LEFT : PlayerLocation.RIGHT;
    matchStartData.enemyUserId = gameManager.player1.sid == sid ? gameManager.player1.dbId : gameManager.player2.dbId;
    matchStartData.sceneData = this.makeObjectDatas(gameManager);
    return matchStartData;
  }
  
  public makeObserverData(
    gameManager : GameManager,
  ) : OnSceneData {
    const matchStartData : OnSceneData = new OnSceneData();

    matchStartData.gameId = gameManager.gameId;
    matchStartData.playerLocation = PlayerLocation.OBSERVER;
    matchStartData.enemyUserId = undefined;
    matchStartData.sceneData = this.makeObjectDatas(gameManager);
    return matchStartData;
  }

  public makeObjectDatas (
    gameManager : GameManager
  ) : ObjectData[] {
    const objects : ObjectData[] = [];
    let body : Box2D.Body = gameManager.simulator.world.GetBodyList();

    while (body != null)
    {
      const object : ObjectData = new ObjectData();
      object.objectId = body.GetUserData().id;
      object.shapeType = body.GetFixtureList().GetType();
      object.x = body.GetPosition().x;
      object.y = body.GetPosition().y;
      object.angle = body.GetAngle();
      if (object.shapeType == Box2D.ShapeType.e_circleShape){
        object.radius = body.GetFixtureList().GetShape().m_radius;
      } else if (
        object.shapeType == Box2D.ShapeType.e_chainShape ||
        object.shapeType == Box2D.ShapeType.e_polygonShape
      ) {
        const shape = body.GetFixtureList().GetShape() as Box2D.ChainShape | Box2D.PolygonShape; 
        object.vertex = shape.m_vertices;
      }
      objects.push(object);
      body = body.GetNext();
    }
    return objects;
  }

  public makeRenderDatas(
    gameManager : GameManager
  ) : RenderData[] {
    const renderDatas : RenderData[] = [];
    let body : Box2D.Body = gameManager.simulator.world.GetBodyList();

    while (body != null)
    {
      const renderData : RenderData = new RenderData();

      renderData.objectId = body.GetUserData().id;
      renderData.x = body.GetPosition().x;
      renderData.y = body.GetPosition().y;
      renderData.angle = body.GetAngle();
      renderDatas.push(renderData);
      body = body.GetNext();
    }
    return renderDatas;
  }

  public makeMatchResultData(
    gameManager : GameManager
  ) : MatchResultData {
    const matchResult = new MatchResultData();
    
    matchResult.leftPlayerId = gameManager.player1.dbId;
    matchResult.rightPlayerId = gameManager.player2.dbId;
    matchResult.leftScore = gameManager.player1.socore;
    matchResult.rightScore = gameManager.player2.socore;
    matchResult.winner = matchResult.leftScore > matchResult.rightScore ? matchResult.leftPlayerId : matchResult.rightPlayerId;
    return matchResult;
  }
}