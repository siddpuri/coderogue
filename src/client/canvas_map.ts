import { PlayerData, LevelData } from '../shared/protocol.js';
import LevelMap from '../shared/level_map.js';

import Client from './client.js';

type Pos = [number, number];

const levelWidth = 80;
const levelHeight = 40;

const triangles = [
    [[1, 8], [7, 8], [4, 0]],
    [[0, 1], [0, 7], [8, 4]],
    [[1, 0], [7, 0], [4, 8]],
    [[8, 1], [8, 7], [0, 4]]
];

export default class CanvasMap {
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private style = 0;
    private level!: LevelData;
    private map!: LevelMap;
    private players!: PlayerData[];

    constructor(
        private readonly client: Client
    ) {
    }

    get backgroundColor()    { return '#f0f0f0'; }
    get foregroundColor()    { return ['#101010', '#000000'][this.style]; }
    get wallColor()          { return ['#101010', '#8080a0'][this.style];}
    get highlightColor()     { return ['#ffff00', '#4040ff'][this.style]; }
    get currentPlayerColor() { return ['#ff0000', '#ff4040'][this.style]; }
    get mobColor()           { return ['#00c000', '#00a000'][this.style]; }
    get font()               { return '10pt sans-serif'; }
    get dx()                 { return 8; }
    get dy()                 { return [10, 8][this.style]; }

    async start(): Promise<void> {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.clearCanvas();       
    }

    setStyle(style: number): void {
        this.style = style;
        if (this.level && this.players) {
            this.render(this.level, this.players);
        }
    }

    clearCanvas(): void {
        this.canvas.width = this.dx * levelWidth;
        this.canvas.height = this.dy * levelHeight;
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.foregroundColor;
    }

    render(level: LevelData, players: PlayerData[]): void {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.level = level;
        this.map = new LevelMap(level.map);
        this.players = players;
        this.clearCanvas();
        let pos: Pos = [0, 0];
        for (let y = 0; y < levelHeight; y++) {
            pos[1] = y;
            for (let x = 0; x < levelWidth; x++) {
                pos[0] = x;
                let playerId = this.map.getPlayerId(pos);
                let mobId = this.map.getMobId(pos);
                if (playerId != null) this.renderPlayer(pos, playerId);
                else if (mobId != null) this.renderMob(pos, mobId);
                else if (this.map.hasWall(pos)) this.renderWall(pos);
                else if (this.map.hasExit(pos)) this.renderExit(pos);
                else if (this.map.hasSpawn(pos)) this.renderSpawn(pos);
            }
        }
    }

    renderPlayer(pos: Pos, playerId: number): void {
        let color = this.foregroundColor;
        if (playerId == this.client.display.highlightedPlayer) {
            color = this.highlightColor;
        }
        if (playerId == this.client.credentials.playerId) {
            color = this.currentPlayerColor;
        }
        let dir = this.players[playerId].dir;
        this.renderArrow(pos, dir, color);
    }

    renderMob(pos: Pos, mobId: number): void {
        let dir = this.level.mobs[mobId].dir;
        this.renderArrow(pos, dir, this.mobColor);
    }

    renderArrow(pos: Pos, dir: number, color: string): void {
        if (this.style == 0) {
            this.setText(pos, '^>v<'[dir], color);
        } else {
            let triangle = triangles[dir];
            let x = pos[0] * this.dx;
            let y = pos[1] * this.dy;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(x + triangle[0][0], y + triangle[0][1]);
            this.ctx.lineTo(x + triangle[1][0], y + triangle[1][1]);
            this.ctx.lineTo(x + triangle[2][0], y + triangle[2][1]);
            this.ctx.fill();
        }
    }

    renderWall(pos: Pos): void {
        if (this.style == 0) {
            this.setText(pos, '#');
        } else {
            let x = pos[0] * this.dx;
            let y = pos[1] * this.dy;
            this.ctx.fillStyle = this.wallColor;
            this.ctx.fillRect(x, y, this.dx, this.dy);
        }
    }

    renderSpawn(pos: Pos): void {
        if (this.style == 0) {
            this.setText(pos, '.');
        } else {
            let x = (pos[0] + .5) * this.dx;
            let y = (pos[1] + .5) * this.dy;
            this.ctx.fillStyle = this.currentPlayerColor;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 1, 1, 0, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    renderExit(pos: Pos): void {
        if (this.style == 0) {
            this.setText(pos, 'o');
        } else {
            let x = (pos[0] + .5) * this.dx;
            let y = (pos[1] + .5) * this.dy;
            this.ctx.strokeStyle = this.currentPlayerColor;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }

    setText(pos: Pos, char: string, color: string = this.foregroundColor): void {
        this.ctx.fillStyle = color;
        if (color == this.highlightColor) {
            this.ctx.fillRect(pos[0] * this.dx, pos[1] * this.dy, this.dx, this.dy);
            this.ctx.fillStyle = this.foregroundColor;
        }
        this.ctx.fillText(char, pos[0] * this.dx, (pos[1] + 1) * this.dy);
        this.ctx.fillStyle = this.foregroundColor;
    }

    getPlayerAt(mouseX: number, mouseY: number): number | null {
        if (!this.level) return null;
        let [x0, y0] = this.getPosAt(mouseX, mouseY);
        let closestPlayerId = null;
        let closestDistance = Infinity;
        for (let y = y0 - 1; y <= y0 + 1; y++) {
            for (let x = x0 - 1; x <= x0 + 1; x++) {
                let playerId = this.getPlayerAtPos([x, y]);
                if (playerId == null) continue;
                let player = this.players[playerId];
                let distance = this.getDistance(mouseX, mouseY, player.pos);
                if (distance < closestDistance) {
                    closestPlayerId = playerId;
                    closestDistance = distance;
                }
            }
        }
        return closestPlayerId;
    }

    getPosAt(mouseX: number, mouseY: number): Pos {
        return [
            Math.floor(mouseX / this.dx),
            Math.floor(mouseY / this.dy)
        ];
    }

    getPlayerAtPos(pos: Pos): number | null {
        if (pos[0] < 0 || pos[0] >= levelWidth) return null;
        if (pos[1] < 0 || pos[1] >= levelHeight) return null;
        return this.map.getPlayerId(pos);
    }

    getDistance(mouseX: number, mouseY: number, playerPos: Pos): number {
        return Math.sqrt(
            Math.pow(mouseX - playerPos[0] * this.dx, 2) +
            Math.pow(mouseY - playerPos[1] * this.dy, 2)
        );
    }
}
