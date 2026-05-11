/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { CardData, createDeck, CARD_WIDTH, CARD_HEIGHT } from '../constants';
import { Card } from './Card';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Github } from 'lucide-react';

interface CardBody {
  id: string;
  body: Matter.Body;
  data: CardData;
}

export const PhysicsTable: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create({ gravity: { x: 0, y: 0 } }));
  const [cards, setCards] = useState<CardBody[]>([]);
  const [draggedBodyId, setDraggedBodyId] = useState<string | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Sync Matter.js with React state for positions
  const [, setRenderTrigger] = useState(0);

  const initPhysics = useCallback(() => {
    const engine = engineRef.current;
    const world = engine.world;
    Matter.World.clear(world, false);

    const width = sceneRef.current?.clientWidth || window.innerWidth;
    const height = sceneRef.current?.clientHeight || window.innerHeight;

    // Boundaries
    const ground = Matter.Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
    const ceiling = Matter.Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });

    Matter.World.add(world, [ground, ceiling, leftWall, rightWall]);

    // Create a deck
    const deckData = createDeck();
    const newCards: CardBody[] = deckData.slice(0, 15).map((data, index) => {
      const x = width / 2 + (index * 2);
      const y = height / 2 + (index * 2);
      const body = Matter.Bodies.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, {
        chamfer: { radius: 10 },
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.05,
      });
      return { id: data.id, body, data };
    });

    Matter.World.add(world, newCards.map(c => c.body));
    setCards(newCards);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const update = () => {
      setRenderTrigger(prev => prev + 1);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      Matter.Runner.stop(runner);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    return initPhysics();
  }, [initPhysics]);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    setDraggedBodyId(id);

    const moveHandler = (moveEvent: MouseEvent) => {
      if (sceneRef.current) {
        const rect = sceneRef.current.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const y = moveEvent.clientY - rect.top;
        
        Matter.Body.setPosition(card.body, { x, y });
        // Give some velocity on release by tracking delta? 
        // Matter does it slightly better with MouseConstraint but custom is fine for simple
      }
    };

    const upHandler = () => {
      setDraggedBodyId(null);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  const throwCards = () => {
    cards.forEach(c => {
      Matter.Body.applyForce(c.body, c.body.position, {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      });
    });
  };

  const resetTable = () => {
    initPhysics();
  };

  return (
    <div className="relative w-full h-screen bg-[#1a4a1a] overflow-hidden flex flex-col">
      {/* Background Texture - Felt */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      
      {/* Header UI */}
      <div className="z-50 p-6 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold tracking-tight">Physics Card Table</h1>
          <p className="text-emerald-300/70 text-sm">Arraste e jogue as cartas com física real</p>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={throwCards}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg"
          >
            <Play size={18} /> Embaralhar Força
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTable}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow-lg"
          >
            <RefreshCw size={18} /> Resetar Mesa
          </motion.button>
        </div>
      </div>

      {/* Physics Container */}
      <div ref={sceneRef} className="flex-1 relative cursor-crosshair">
        {cards.map((c) => (
          <Card
            key={c.id}
            data={c.data}
            isDragging={draggedBodyId === c.id}
            onMouseDown={(e) => handleMouseDown(c.id, e)}
            style={{
              left: 0,
              top: 0,
              transform: `translate(${c.body.position.x - CARD_WIDTH / 2}px, ${c.body.position.y - CARD_HEIGHT / 2}px) rotate(${c.body.angle}rad)`,
            }}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/40 text-xs flex gap-4">
        <span>Cards: {cards.length}</span>
        <span>|</span>
        <span>Física: Matter.js</span>
        <span>|</span>
        <span>Use o mouse para jogar as cartas</span>
      </div>
    </div>
  );
};
