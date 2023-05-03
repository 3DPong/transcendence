// import * as Helper from '../../../helpers/helpers.d.ts';
// Helper.using(Box2D, 'b2.+');

var embox2dTest_pongGame = function() {
    //constructor
}

embox2dTest_pongGame.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,0), true );
}

embox2dTest_pongGame.prototype.setup = function() {

    //set up the Box2D scene here - the world is already created 

    // data members (change this to class later)
    this._world = world; // 원래 전역으로 선언된 world. 나중에 바꿀 예정.
    this._cageFixture = null;
    this._ballFixture = null;
    this._racketFixtures = {} // racket objects

    // helper member functions
    this._createCageGround = function(){};
    this._createWorld = function(){};
    this._createBall = function(){};
    this._createRacket = function(){};

 
    // setup world (no gravity)
    this._createWorld && 
    (
        this._createWorld = function() {
            console.dir(this._world); // 전역 world object.
            // this._world.SetGravity( new b2Vec2(0, 0) );
            // ..
        }
    )

     
    // cage ground
    this._createCageGround &&
    (
        this._createCageGround = function() {
            console.log("setting cage...");

            const WIDTH = 15;
            const HEIGHT = 10;
            const X = 0;
            const Y = 0;
            const w_delta = WIDTH / 2;
            const h_delta = HEIGHT / 2;

            const cageVerts = [];
            cageVerts[0] = new b2Vec2(X - w_delta, Y + h_delta);
            cageVerts[1] = new b2Vec2(X + w_delta, Y + h_delta);
            cageVerts[2] = new b2Vec2(X + w_delta, Y - h_delta);
            cageVerts[3] = new b2Vec2(X - w_delta, Y - h_delta);
            const cageChainShape = new createChainShape(cageVerts, true);

            const bd = new b2BodyDef();
            bd.set_type( Module.b2_staticBody );

            this._cageFixture = world.CreateBody(bd).CreateFixture(cageChainShape, 0.0);
        }
    )


    // ball moving around
    this._createBall &&
    (
        this._createBall = function() {
            console.log("setting ball...");

            const RADIUS = 0.5;
            const X = 0;
            const Y = 0;

            const bd = new b2BodyDef();
            bd.set_type( Module.b2_dynamicBody );
            bd.set_position( new b2Vec2(X, Y) );

            const fd = new b2FixtureDef();
            const shape = new b2CircleShape();
            shape.set_m_radius(RADIUS);
            fd.set_shape( shape );
            fd.set_density( 4.0 );
            fd.set_restitution( 1.0 ); // 이건 충돌 후 속도 변화
            fd.set_friction( 0.3 ); // 이 값이 0 이상일 경우 벽에 부딪히면서 반사 각이 감소.

            this._ballFixture = this._world.CreateBody(bd).CreateFixture(fd);
        }
    )

    // change to enum type (if TS)
    this._ePlayerType = {
        LEFT : 0,
        RIGHT : 1
    }

    // 왼쪽 가동 모터 edge
    this._createRestraint = function(){
        const bd = new b2BodyDef();
        bd.set_position( new b2Vec2(-3.0, 0.0) );

        const edge = new b2EdgeShape();
        // edge.Set( new b2Vec2(-5, -3), new b2Vec2(-5, 3) );
        // bd.position.Set( new b2Vec2(-5, -3), new b2Vec2(-5, 3) );

        const restraint = this._world.CreateBody(bd).CreateFixture(edge, 0.0);
        return restraint;
    }


    // How to create slider joint
    // https://www.iforce2d.net/b2dtut/joints-prismatic

    // create racket ( paddle )
    var JOINT_DISTANCE = -3;
    this._createRacket &&
    (
        this._createRacket = function(playerType, width, height){
            console.log("creating racket...");

            const fd = new b2FixtureDef();
            fd.density = 5.0;
            fd.friction = 1;
            fd.restitution = 1.0;

            const bd = new b2BodyDef();
            bd.set_type( Module.b2_dynamicBody );
            // bd.set_position( new b2Vec2(-3.0, 0.0) );
            console.dir(bd);

            const shape = new b2PolygonShape();
            shape.SetAsBox(width, height);
            fd.set_shape( shape );

            const racketFixture = this._world.CreateBody(bd).CreateFixture(fd);
            this._racketFixtures[playerType] = racketFixture;

            this._restraintLeft = this._createRestraint();
            this._jointRacketToRestraints(racketFixture, this._restraintLeft, JOINT_DISTANCE)
        }
    )

    // https://box2d.org/documentation/structb2_prismatic_joint_def.html
    this._jointRacketToRestraints = function (rocketFixture, restraintsFixture, dist){

        const jointDef = new b2PrismaticJointDef();

        const bodyA = restraintsFixture.GetBody();
        const bodyB = rocketFixture.GetBody();
        const anchor = new b2Vec2( dist, 0.0 );
        const axis = new b2Vec2(0.0, 1.0);

        jointDef.Initialize(bodyA, bodyB, anchor, axis);

        jointDef.collideConnected = false;
        jointDef.enableMotor = true;
        jointDef.maxMotorForce = 2;

        this._world.CreateJoint(jointDef);
    }


   





   // ------------------------------
    console.dir(this);
    this._createWorld();
    this._createCageGround();
    this._createBall();
    // this._createRestraint();
    // this._createRacket(this._ePlayerType.LEFT, 0.2, 1);

    // ------------------------------

}

embox2dTest_pongGame.prototype.step = function() {
    //this function will be called at the beginning of every time step
}

embox2dTest_pongGame.prototype.onKeyDown = function(canvas, evt) {
    if ( evt.keyCode == 65 ) { // 'a'
        //do something when the 'a' key is pressed
    }
}

embox2dTest_pongGame.prototype.onKeyUp = function(canvas, evt) {
    if ( evt.keyCode == 65 ) { // 'a'
        //do something when the 'a' key is released
    }
}
