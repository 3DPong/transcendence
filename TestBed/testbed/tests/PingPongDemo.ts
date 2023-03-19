// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as Box2D from "@box2d";
import * as testbed from "@testbed";
import { ObjectFactory } from "./ts_Demo/simul/object/ObjectFactory.js";

function ContactListenerInit(world: Box2D.World){
  //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
  //  world.GetContactManager().m_contactListener.EndContact = ()=>{};
  //  world.GetContactManager().m_contactListener.PreSolve = ()=>{};
    world.GetContactManager(    
    ).m_contactListener.PostSolve = function(
      contact: Box2D.Contact, impulse: Box2D.ContactImpulse
    ): void {
      console.log('call contactListener postsolve');
    }
}
export class AddPair extends testbed.Test {
  //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
  public objectFactory : ObjectFactory = new ObjectFactory();
  
  constructor(){
    super();
      //ball create & add to world
      this.m_world.SetGravity(new Box2D.Vec2(0,0));//무중력
      this.objectFactory.createBall(this.m_world);
      this.objectFactory.createGround(this.m_world);
      this.objectFactory.createPaddle(this.m_world, -23, 0);//left
      this.objectFactory.createPaddle(this.m_world, 23, 0);//right
      ContactListenerInit(this.m_world);
  }

  public Keyboard(key: string) {
    switch (key) {
      default:
        super.Keyboard(key);
        break;
    }
  }

  public Step(settings: testbed.Settings): void {
    super.Step(settings);
  }

  public static Create(): testbed.Test {
    return new AddPair();
  }
}

export const testIndex: number = testbed.RegisterTest("PingPong:", "pingPongTest", AddPair.Create);
