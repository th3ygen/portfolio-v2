'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * The single registration point. Every animated component imports gsap and
 * ScrollTrigger from here rather than from 'gsap' directly — registration must
 * happen exactly once, and routing it through one module guarantees that.
 *
 * GSAP 3.15 ships ScrollTrigger in the base package under its standard
 * no-charge license (https://gsap.com/standard-license).
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
