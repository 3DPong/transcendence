import * as b2 from "@box2d";
export declare class EmittedParticleCallback {
    /**
     * Called for each created particle.
     */
    ParticleCreated(system: b2.ParticleSystem, particleIndex: number): void;
}
/**
 * Emit particles from a circular region.
 */
export declare class RadialEmitter {
    /**
     * Pointer to global world
     */
    m_particleSystem: b2.ParticleSystem | null;
    /**
     * Called for each created particle.
     */
    m_callback: EmittedParticleCallback | null;
    /**
     * Center of particle emitter
     */
    m_origin: b2.Vec2;
    /**
     * Launch direction.
     */
    m_startingVelocity: b2.Vec2;
    /**
     * Speed particles are emitted
     */
    m_speed: number;
    /**
     * Half width / height of particle emitter
     */
    m_halfSize: b2.Vec2;
    /**
     * Particles per second
     */
    m_emitRate: number;
    /**
     * Initial color of particle emitted.
     */
    m_color: b2.Color;
    /**
     * Number particles to emit on the next frame
     */
    m_emitRemainder: number;
    /**
     * Flags for created particles, see b2ParticleFlag.
     */
    m_flags: b2.ParticleFlag;
    /**
     * Group to put newly created particles in.
     */
    m_group: b2.ParticleGroup | null;
    /**
     * Calculate a random number 0.0..1.0.
     */
    static Random(): number;
    __dtor__(): void;
    /**
     * Set the center of the emitter.
     */
    SetPosition(origin: b2.Vec2): void;
    /**
     * Get the center of the emitter.
     */
    GetPosition(out: b2.Vec2): b2.Vec2;
    /**
     * Set the size of the circle which emits particles.
     */
    SetSize(size: b2.Vec2): void;
    /**
     * Get the size of the circle which emits particles.
     */
    GetSize(out: b2.Vec2): b2.Vec2;
    /**
     * Set the starting velocity of emitted particles.
     */
    SetVelocity(velocity: b2.Vec2): void;
    /**
     * Get the starting velocity.
     */
    GetVelocity(out: b2.Vec2): b2.Vec2;
    /**
     * Set the speed of particles along the direction from the
     * center of the emitter.
     */
    SetSpeed(speed: number): void;
    /**
     * Get the speed of particles along the direction from the
     * center of the emitter.
     */
    GetSpeed(): number;
    /**
     * Set the flags for created particles.
     */
    SetParticleFlags(flags: b2.ParticleFlag): void;
    /**
     * Get the flags for created particles.
     */
    GetParticleFlags(): b2.ParticleFlag;
    /**
     * Set the color of particles.
     */
    SetColor(color: b2.Color): void;
    /**
     * Get the color of particles emitter.
     */
    GetColor(out: b2.Color): b2.Color;
    /**
     * Set the emit rate in particles per second.
     */
    SetEmitRate(emitRate: number): void;
    /**
     * Get the current emit rate.
     */
    GetEmitRate(): number;
    /**
     * Set the particle system this emitter is adding particles to.
     */
    SetParticleSystem(particleSystem: b2.ParticleSystem): void;
    /**
     * Get the particle system this emitter is adding particle to.
     */
    GetParticleSystem(): b2.ParticleSystem | null;
    /**
     * Set the callback that is called on the creation of each
     * particle.
     */
    SetCallback(callback: EmittedParticleCallback): void;
    /**
     * Get the callback that is called on the creation of each
     * particle.
     */
    GetCallback(): EmittedParticleCallback | null;
    /**
     * This class sets the group flags to b2_particleGroupCanBeEmpty
     * so that it isn't destroyed and clears the
     * b2_particleGroupCanBeEmpty on the group when the emitter no
     * longer references it so that the group can potentially be
     * cleaned up.
     */
    SetGroup(group: b2.ParticleGroup | null): void;
    /**
     * Get the group particles should be created within.
     */
    GetGroup(): b2.ParticleGroup | null;
    /**
     * dt is seconds that have passed, particleIndices is an
     * optional pointer to an array which tracks which particles
     * have been created and particleIndicesCount is the size of the
     * particleIndices array. This function returns the number of
     * particles created during this simulation step.
     */
    Step(dt: number, particleIndices?: number[], particleIndicesCount?: number): number;
}
