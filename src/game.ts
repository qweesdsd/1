export type Matrix = number[][];

const SHAPES: Matrix[] = [
  // I
  [[1,1,1,1]],
  // J
  [[1,0,0],[1,1,1]],
  // L
  [[0,0,1],[1,1,1]],
  // O
  [[1,1],[1,1]],
  // S
  [[0,1,1],[1,1,0]],
  // T
  [[0,1,0],[1,1,1]],
  // Z
  [[1,1,0],[0,1,1]]
];

function rotateMatrix(m: Matrix): Matrix {
  const H = m.length, W = m[0].length;
  const res: Matrix = Array.from({length: W}, () => Array(H).fill(0));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) res[x][H - 1 - y] = m[y][x];
  return res;
}

class Piece {
  matrix: Matrix;
  x: number;
  y: number;
  constructor(matrix: Matrix, x: number, y: number){ this.matrix = matrix; this.x = x; this.y = y; }
  rotate(){ this.matrix = rotateMatrix(this.matrix); }
}

export class Tetris {
  width: number;
  height: number;
  tileSize: number;
  ctx: CanvasRenderingContext2D;
  grid: number[][];
  current: Piece | null = null;
  nextQueue: Matrix[] = [];
  dropInterval = 1000; // ms
  dropTimer = 0;
  running = false;
  lastTime = 0;
  score = 0;
  onScore: (s:number)=>void;
  holdPiece: Matrix | null = null;
  canHold = true;

  constructor(w:number,h:number,tile:number,ctx:CanvasRenderingContext2D,onScore:(s:number)=>void){
    this.width = w; this.height = h; this.tileSize = tile; this.ctx = ctx; this.onScore = onScore;
    this.grid = Array.from({length:h}, () => Array(w).fill(0));
    for (let i=0;i<3;i++) this.nextQueue.push(this.randomShape());
  }

  randomShape(){ return SHAPES[Math.floor(Math.random()*SHAPES.length)]; }

  spawn(){
    const shape = this.nextQueue.shift()!;
    this.nextQueue.push(this.randomShape());
    const x = Math.floor((this.width - shape[0].length)/2);
    const piece = new Piece(shape.map(r=>r.slice()), x, 0);
    if (this.collide(piece)) { this.running = false; alert('Game Over — score: '+this.score); }
    this.current = piece; this.canHold = true;
  }

  start(){ this.running = true; this.score = 0; this.onScore(this.score); this.grid = Array.from({length:this.height}, ()=>Array(this.width).fill(0)); this.spawn(); requestAnimationFrame(this.update.bind(this)); }

  update(t:number){ if (!this.running) return; const dt = t - this.lastTime; this.lastTime = t; this.dropTimer += dt; if (this.dropTimer > this.dropInterval) { this.dropTimer = 0; this.step(); } this.draw(); requestAnimationFrame(this.update.bind(this)); }

  step(){ if (!this.current) return; this.current.y += 1; if (this.collide(this.current)) { this.current.y -= 1; this.lock(); this.clearLines(); this.spawn(); } }

  lock(){ if (!this.current) return; const m = this.current.matrix; for (let y=0;y<m.length;y++) for (let x=0;x<m[y].length;x++) if (m[y][x]) { const gx = this.current.x + x, gy = this.current.y + y; if (gy>=0 && gy<this.height && gx>=0 && gx<this.width) this.grid[gy][gx]=m[y][x]; } this.current = null; }

  clearLines(){ let lines=0; for (let y=this.height-1;y>=0;y--){ if (this.grid[y].every(v=>v!==0)){ this.grid.splice(y,1); this.grid.unshift(Array(this.width).fill(0)); lines++; y++; }} if (lines>0){ this.score += lines * 100; this.onScore(this.score); this.dropInterval = Math.max(100, this.dropInterval - lines*20); }}

  collide(piece: Piece){ const m = piece.matrix; for (let y=0;y<m.length;y++) for (let x=0;x<m[y].length;x++) if (m[y][x]){ const gx = piece.x + x, gy = piece.y + y; if (gx<0 || gx>=this.width || gy>=this.height) return true; if (gy>=0 && this.grid[gy][gx]) return true; } return false; }

  move(dir:number){ if (!this.current) return; this.current.x += dir; if (this.collide(this.current)) this.current.x -= dir; }

  softDrop(){ // move down by one
    if (!this.current) return; this.current.y +=1; if (this.collide(this.current)){ this.current.y -=1; this.lock(); this.clearLines(); this.spawn(); }
  }

  hardDrop(){ if (!this.current) return; while(!this.collide(this.current)){ this.current.y +=1; } this.current.y -=1; this.lock(); this.clearLines(); this.spawn(); }

  rotate(){ if (!this.current) return; this.current.rotate(); // simple wall kick
    if (this.collide(this.current)){
      // try kicks
      for (let k of [-1,1,-2,2]){ this.current.x += k; if (!this.collide(this.current)) return; this.current.x -= k; }
      // revert
      // rotate 3 times to return
      this.current.rotate(); this.current.rotate(); this.current.rotate();
    }
  }

  hold(){ if (!this.current) return; if (!this.canHold) return; const cur = this.current.matrix; if (!this.holdPiece){ this.holdPiece = cur; this.current = null; this.spawn(); } else { const tmp = this.holdPiece; this.holdPiece = cur; this.current = new Piece(tmp!.map(r=>r.slice()), Math.floor((this.width - tmp![0].length)/2), 0); if (this.collide(this.current)) { this.running=false; alert('Game Over — score: '+this.score); } }
    this.canHold = false;
  }

  draw(){ const {ctx, width, height, tileSize} = this; ctx.clearRect(0,0, width*tileSize, height*tileSize);
    // draw grid
    for (let y=0;y<height;y++) for (let x=0;x<width;x++){ const v = this.grid[y][x]; ctx.fillStyle = v ? '#39f' : '#111'; ctx.fillRect(x*tileSize, y*tileSize, tileSize-1, tileSize-1); }
    // draw current
    if (this.current){ const m = this.current.matrix; for (let y=0;y<m.length;y++) for (let x=0;x<m[y].length;x++) if (m[y][x]){ const gx = this.current.x + x, gy = this.current.y + y; if (gy>=0) { ctx.fillStyle = '#f90'; ctx.fillRect(gx*tileSize, gy*tileSize, tileSize-1, tileSize-1); } } }
  }
}
