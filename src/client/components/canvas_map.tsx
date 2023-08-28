import { useContext, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux_hooks';

import { PlayerData } from '../../shared/protocol.js';
import LevelMap from '../../shared/level_map.js';

import * as Context from '../client/context';
import { useGetStateQuery } from '../client/server_api.js';

import { displaySlice } from '../state/display_state';

type Pos = [number, number];

const levelWidth = 80;
const levelHeight = 40;

const triangles = [
    [[1, 8], [7, 8], [4, 0]],
    [[0, 1], [0, 7], [8, 4]],
    [[1, 0], [7, 0], [4, 8]],
    [[8, 1], [8, 7], [0, 4]]
];

export default function CanvasMap() {
    const client = useContext(Context.ClientInstance);
    const state = useGetStateQuery()?.data;
    const actions = displaySlice.actions;
    const display = useAppSelector(state => state.display);
    const dispatch = useAppDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const backgroundColor    = '#f0f0f0';
    const foregroundColor    = ['#101010', '#000000'][display.style];
    const wallColor          = ['#101010', '#8080a0'][display.style];
    const highlightColor     = ['#ffff00', '#4040ff'][display.style];
    const currentPlayerColor = ['#ff0000', '#ff4040'][display.style];
    const mobColor           = ['#00c000', '#00a000'][display.style];
    const font               = '10pt sans-serif';
    const dx                 = 8;
    const dy                 = [10, 8][display.style];

    let map = new LevelMap(state?.levels[display.level].map);

    useEffect(render);

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={e => setMouseCoords(getCoordsFromEvent(e))}
            onMouseLeave={() => setMouseCoords(null)}
            onClick={e => highlightPlayerAt(e)} />
    );

    function setMouseCoords(coords: [number, number] | null): void {
        dispatch(actions.setCoords(coords));
    }

    function render(): void {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        clearCanvas();
        renderMap();

        function clearCanvas(): void {
            canvas.width = dx * levelWidth;
            canvas.height = dy * levelHeight;
            ctx.font = font;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = foregroundColor;
        }

        function renderMap(): void {
            let pos: Pos = [0, 0];
            for (let y = 0; y < levelHeight; y++) {
                pos[1] = y;
                for (let x = 0; x < levelWidth; x++) {
                    pos[0] = x;
                    let playerId = map.getPlayerId(pos);
                    let mobId = map.getMobId(pos);
                    if (playerId != null) renderPlayer(pos, playerId);
                    else if (mobId != null) renderMob(pos, mobId);
                    else if (map.hasWall(pos)) renderWall(pos);
                    else if (map.hasExit(pos)) renderExit(pos);
                    else if (map.hasSpawn(pos)) renderSpawn(pos);
                }
            }
        }

        function renderPlayer(pos: Pos, playerId: number): void {
            let color = foregroundColor;
            if (playerId == client.display.highlightedPlayer) {
                color = highlightColor;
            }
            if (playerId == client.credentials.playerId) {
                color = currentPlayerColor;
            }
            let dir = state!.players[playerId]!.dir;
            renderArrow(pos, dir, color);
        }

        function renderMob(pos: Pos, mobId: number): void {
            let dir = state!.levels[display.level].mobs[mobId].dir;
            renderArrow(pos, dir, mobColor);
        }

        function renderArrow(pos: Pos, dir: number, color: string): void {
            if (display.style == 0) {
                setText(pos, '^>v<'[dir], color);
            } else {
                let triangle = triangles[dir];
                let x = pos[0] * dx;
                let y = pos[1] * dy;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x + triangle[0][0], y + triangle[0][1]);
                ctx.lineTo(x + triangle[1][0], y + triangle[1][1]);
                ctx.lineTo(x + triangle[2][0], y + triangle[2][1]);
                ctx.fill();
            }
        }

        function renderWall(pos: Pos): void {
            if (display.style == 0) {
                setText(pos, '#');
            } else {
                let x = pos[0] * dx;
                let y = pos[1] * dy;
                ctx.fillStyle = wallColor;
                ctx.fillRect(x, y, dx, dy);
            }
        }

        function renderSpawn(pos: Pos): void {
            if (display.style == 0) {
                setText(pos, '.');
            } else {
                let x = (pos[0] + .5) * dx;
                let y = (pos[1] + .5) * dy;
                ctx.fillStyle = currentPlayerColor;
                ctx.beginPath();
                ctx.ellipse(x, y, 1, 1, 0, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        function renderExit(pos: Pos): void {
            if (display.style == 0) {
                setText(pos, 'o');
            } else {
                let x = (pos[0] + .5) * dx;
                let y = (pos[1] + .5) * dy;
                ctx.strokeStyle = currentPlayerColor;
                ctx.beginPath();
                ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        function setText(pos: Pos, char: string, color: string = foregroundColor): void {
            ctx.fillStyle = color;
            if (color == highlightColor) {
                ctx.fillRect(pos[0] * dx, pos[1] * dy, dx, dy);
                ctx.fillStyle = foregroundColor;
            }
            ctx.fillText(char, pos[0] * dx, (pos[1] + 1) * dy);
            ctx.fillStyle = foregroundColor;
        }
    }

    function getCoordsFromEvent(event: React.MouseEvent): [number, number] {
        let x = Math.floor(event.nativeEvent.offsetX / 8);
        let y = Math.floor(event.nativeEvent.offsetY / [10, 8][display.style]);
        return [x, y];
    }

    function highlightPlayerAt(event: React.MouseEvent): void {
        getPlayerAt(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    }

    function getPlayerAt(mouseX: number, mouseY: number): number | null {
        if (!display.level) return null;
        let [x0, y0] = getPosAt(mouseX, mouseY);
        let closestPlayerId: number | null = null;
        let closestDistance = Infinity;
        for (let y = y0 - 1; y <= y0 + 1; y++) {
            for (let x = x0 - 1; x <= x0 + 1; x++) {
                let playerId = getPlayerAtPos([x, y]);
                if (playerId == null) continue;
                let player = state?.players[playerId] as PlayerData;
                let distance = getDistance(mouseX, mouseY, player.pos);
                if (distance < closestDistance) {
                    closestPlayerId = playerId;
                    closestDistance = distance;
                }
            }
        }
        return closestPlayerId;
    }

    function getPosAt(mouseX: number, mouseY: number): Pos {
        return [
            Math.floor(mouseX / dx),
            Math.floor(mouseY / dy)
        ];
    }

    function getPlayerAtPos(pos: Pos): number | null {
        if (pos[0] < 0 || pos[0] >= levelWidth) return null;
        if (pos[1] < 0 || pos[1] >= levelHeight) return null;
        return map.getPlayerId(pos);
    }

    function getDistance(mouseX: number, mouseY: number, playerPos: Pos): number {
        return Math.sqrt(
            Math.pow(mouseX - playerPos[0] * dx, 2) +
            Math.pow(mouseY - playerPos[1] * dy, 2)
        );
    }
}
