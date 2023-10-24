let toggle_spot
let times
let spot_params
let xmin, xmax, ymin, ymax
let xmin_loc, xmax_loc, ymin_loc, ymax_loc

function linspace(start, end, n) {
  let delta = (end - start) / (n - 1)
  let array = []
  for (let i = 0; i < n; i++) {
    array.push(start + i * delta)
  }
  return array;
}

function calc_curve(params) {
  xs = []
  ys = []
  for (let i in times) {
    t = times[i]
    a = t/params[4]
    b = -Math.exp(-a)
    c = (1+b)/a
    r = params[0]+params[1]*c+params[2]*(c+b)
    r += params[3]*((1-Math.exp(-t/params[5]))/(t/params[5])-Math.exp(-t/params[5]))
    x = (xmax_loc-xmin_loc)*(t - xmin)/(xmax - xmin)+xmin_loc
    y = (ymax_loc-ymin_loc)*(r - ymin)/(ymax - ymin)+ymin_loc
    xs.push(x)
    ys.push(y)
  }
  return [xs, ys]
}

function plot_curve(xy) {
  for (let i = 1; i < xy[0].length; i++) {
    line(xy[0][i-1], xy[1][i-1], xy[0][i], xy[1][i])
  }
}

function draw_graph() {
  ymin_loc = windowHeight*0.95
  ymax_loc = windowHeight*0.05
  xmin_loc = 0.25 * windowWidth
  xmax_loc = 0.95 * windowWidth
  stroke('black')
  line(xmin_loc, ymin_loc, xmax_loc, ymin_loc)
  line(xmin_loc, ymin_loc, xmin_loc, ymax_loc)
}

function preload() {
  times = linspace(0.01, 30, 100)
  spot_params = [0.032467,0.022916,0.025233,0.058006,0.684604,12.76429]
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  toggle_spot = createCheckbox('Plot Par Curve', true)
  toggle_spot.position(10,50)
  xmin = 0.01
  xmax = 30
  ymin = 0
  ymax = 0.08
}

function draw() {
  background(220);
  
  draw_graph()
  
  if (toggle_spot.checked()) {
    spot_plot = calc_curve(spot_params)
    plot_curve(spot_plot)
  }
}
