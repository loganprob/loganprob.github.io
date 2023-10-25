// controlling overall app layout
var leftside_visible = true
var rightside_visible = true
var legend_visible = true

// series plotting control
//var toggle_trsy_par, toggle_trsy_spot

// graph math & formatting variables
var left_sidebar_bounds, right_sidebar_bounds, info_header_yloc
var graph_xmin, graph_xmax, graph_ymin, graph_ymax
var unit_xmin, unit_xmax, unit_ymin, unit_ymax
var global_ymin = -0.05
var global_ymax = 0.25
var global_min_ydelta = 0.015
var global_xmin = 0.01
var global_xmax = 35
var global_min_xdelta = 0.5

var color_background = 'rgb(28,28,28)'
var color_transparent_bgd = 'rgba(28,28,28,0.75)'
var color_graph_orange = 'rgb(250,100,0)'
var color_graph_mint = 'rgb(121,201,158)'

// curve math stuff
var data_date = new Date()
var fwd_time = 0.0
var par_params = [0.032467,0.022916,0.025233,0.058006,0.684604,12.76429]
var spot_params = [0.03064, 0.02494, 0.02825, 0.0676, 0.7393, 13.6699]
var plot_par = true
var plot_spot = true
var par_data = []
var spot_data = []
var recalc_yields = true


function abs_to_relative_x(x) {
  return min(1,max(0,(x-graph_xmin)/(graph_xmax-graph_xmin)))
}

function abs_to_relative_y(y) {
  return min(1,max(0,(y-graph_ymin)/(graph_ymax-graph_ymin)))
}

function relative_to_unit_x(x) {
  return (unit_xmax-unit_xmin)*x+unit_xmin
}

function relative_to_unit_y(y) {
  return (unit_ymax-unit_ymin)*y+unit_ymin
}

function unit_to_pxl_y(y) {
  return (y-unit_ymin)/(unit_ymax-unit_ymin)*(graph_ymax-graph_ymin)+graph_ymin
}

function unit_to_pxl_x(x) {
  return (x-unit_xmin)/(unit_xmax-unit_xmin)*(graph_xmax-graph_xmin)+graph_xmin
}

function render_leftside() {
  if (leftside_visible) {
    left_sidebar_bounds = windowWidth*0.2
    graph_xmin = left_sidebar_bounds + 50
    noStroke()
    fill('white')
    textSize(16)
    text('Controls & Info', 10, info_header_yloc+10)
    textSize(12)
    text('Reset : F5', 10, info_header_yloc+35)
    text('Toggle Fullscreen : F11 (reset after)', 10, info_header_yloc+55)
    text('Pan Y-Axis ( yield ): Left Mouse Button + Drag', 10, info_header_yloc+75)
    text('Zoom Y-Axis ( yield ): Mouse Scrollwheel', 10, info_header_yloc+95)
    text('Zoom X-Axis ( time ): Alt + Mouse Scrollwheel', 10, info_header_yloc+115)
    text('Change forward-time: Shift + Mouse Scrollwheel', 10, info_header_yloc+135)
    text('Reset forward-time to zero: F', 10, info_header_yloc+155)
    text('Toggle Left Sidebar: Q', 10, info_header_yloc+175)
    text('Toggle Right Sidebar: W', 10, info_header_yloc+195)
  } else {
    left_sidebar_bounds = 0
    graph_xmin = left_sidebar_bounds + 50
  }
}

function render_rightside() {
  if (rightside_visible) {
    right_sidebar_bounds = windowWidth*0.8
    graph_xmax = right_sidebar_bounds - 50
  } else {
    right_sidebar_bounds = windowWidth
    graph_xmax = right_sidebar_bounds - 50
  }
}

function render_legend() {
  if (legend_visible) {
    stroke('white')
    fill(color_transparent_bgd)
    legend_origin = graph_xmax-305
    rect(legend_origin, 5, 300, 200)
    noStroke()
    fill('white')
    text(`Forward time: ${fwd_time}`, legend_origin+10, 15)
  }
}


function draw_gui() { // everything besides plots
  render_leftside()
  render_rightside()
  
  // middle widgets
  fill('white')
  stroke('white')
  line(left_sidebar_bounds, 0, left_sidebar_bounds, windowHeight)
  line(right_sidebar_bounds, 0, right_sidebar_bounds, windowHeight)
  textSize(14)
  
  // drawing horizontal gridlines 
  if (unit_ymax-unit_ymin<0.075) {y_grid_scale = 0.005} 
  else if (unit_ymax-unit_ymin<0.15) {y_grid_scale = 0.01}
  else {y_grid_scale = 0.02}
  drawingContext.setLineDash([1, 15])
  for (let y_grid=round(unit_ymin,2); y_grid<unit_ymax; y_grid+=y_grid_scale) {
    if (y_grid>unit_ymin) {
      noStroke()
      textAlign(RIGHT, CENTER)
      y_tick = round(y_grid*100,2)
      text(`${isNaN(y_tick) ? '0' : y_tick}%`, graph_xmin-5, unit_to_pxl_y(y_grid))
      stroke('gray')
      line(graph_xmin,unit_to_pxl_y(y_grid),graph_xmax,unit_to_pxl_y(y_grid))
    }
  }
  
  // drawing vertical gridlines
  if (unit_xmax-unit_xmin<1) {x_grid_scale = 0.16} 
  else if(unit_xmax-unit_xmin<2.5) {x_grid_scale = 0.5} 
  else if(unit_xmax-unit_xmin<7) {x_grid_scale = 1} 
  else if(unit_xmax-unit_xmin<15) {x_grid_scale = 2.5} 
  else {x_grid_scale = 5}
  for (let x_grid=unit_xmin; x_grid<=unit_xmax; x_grid+=x_grid_scale) {
    label_date = new Date()
    label_date.setDate(data_date.getDate()+(x_grid+fwd_time)*365.25)
    textAlign(CENTER, TOP)
    noStroke()
    if (fwd_time>0) {
      fill('red')
    }
    text(`${label_date.getMonth()+1}/${label_date.getFullYear()}`,unit_to_pxl_x(x_grid),graph_ymin+10)
    fill('white')
    if (x_grid==unit_xmin) {
      text('time to maturity:',graph_xmin+20,graph_ymin+30)
    } else {
      label_time = '1'
      text(x_grid>1 ? `${round(x_grid,1)} years` : `${round(x_grid*12)} months`,unit_to_pxl_x(x_grid),graph_ymin+30)
      stroke('gray')
      line(unit_to_pxl_x(x_grid),graph_ymin,unit_to_pxl_x(x_grid),graph_ymax)
    }
  }
  textAlign(LEFT, TOP)
  drawingContext.setLineDash([])
  stroke('white')
  // other aesthetic lines
  line(graph_xmin, graph_ymin, graph_xmax, graph_ymin)
  line(graph_xmin, graph_ymin, graph_xmin, graph_ymax)
  line(0,info_header_yloc, left_sidebar_bounds, info_header_yloc)
  render_legend() // at the bottom so everything else renders below it
}

function get_rate(t, params) {
  a = t/params[4]
  b = -Math.exp(-a)
  c = (1+b)/a
  r = params[0]+params[1]*c+params[2]*(c+b)
  r += params[3]*((1-Math.exp(-t/params[5]))/(t/params[5])-Math.exp(-t/params[5]))
  return r;
}

function get_fwd_rate(fwd, term, params) {
  term = max(term, 0.001);
  let a = (get_rate(fwd+term,params)+1)**(fwd+term);
  let b = (get_rate(fwd,params)+1)**(fwd);
  return (a/b)**(1/term)-1;
}

function plot_curves() {
  max_time = min(30,unit_xmax)
  num_pts = 100
  noFill()
  stroke(color_graph_orange)
  beginShape()
  for (let t=global_xmin; t<=max_time;t+=max_time/num_pts) {
     if (plot_spot) {
       if (fwd_time>0) {
         vertex(unit_to_pxl_x(t), unit_to_pxl_y(get_fwd_rate(fwd_time, t, spot_params)))
       } else {
         vertex(unit_to_pxl_x(t), unit_to_pxl_y(get_rate(t,spot_params)))
       }
     }
  }
  endShape()
  stroke(color_graph_mint)
  beginShape()
  for (let t=global_xmin; t<=max_time;t+=max_time/num_pts) {
     if (plot_par) {
       vertex(unit_to_pxl_x(t), unit_to_pxl_y(get_rate(t,par_params)))
     }
  }
  endShape()
  fill('black')
  stroke('black')
}

// key press handler
function keyTyped(event) {
  if (event.code=='KeyQ') {
    leftside_visible = !(leftside_visible)
  }
  if (event.code=='KeyW') {
    rightside_visible = !(rightside_visible)
  }
  if (event.code=='KeyF') {
    fwd_time = 0
  }
}

function mouseWheel(event) {
  if (event.clientX<graph_xmin || event.clientX>graph_xmax || event.clientY>graph_ymin || event.clientY<graph_ymax) {
    return // do nothing if mouse not in graph area
  }
  if (event.altKey) { // zoom the x-axis
    unit_xmax += unit_xmax*(event.delta/1000)
    unit_xmax = max(global_min_xdelta,min(global_xmax, unit_xmax))
    return
  } else if (event.shiftKey) { // shift the forward-time
    fwd_time -= event.delta*0.0008
    fwd_time = max(0,min(5, fwd_time))
    //console.log(event.delta/1000)
  } else { // zoom the y-axis
    delta_yrange = -(unit_ymax-unit_ymin)*(event.delta/1000)
    if (unit_ymax-unit_ymin<=global_min_ydelta & delta_yrange>0) {
      return // prevents further zooming & unindented panning once already max zoomed in 
    }
    rel_y = abs_to_relative_y(event.clientY)
    unit_ymin += rel_y*delta_yrange
    unit_ymax -= (1-rel_y)*delta_yrange
    unit_ymin = max(global_ymin, unit_ymin)
    unit_ymax = min(global_ymax, unit_ymax)
  }
}
    
function mouseDragged(event) {
  delta_y_pxl = event.movementY
  unit_delta_y = -delta_y_pxl/(graph_ymax-graph_ymin)*(unit_ymax-unit_ymin)
  if ((unit_ymin<=global_ymin & unit_delta_y<0) || (unit_ymax>=global_ymax & unit_delta_y>0)) {
    return // stops the unintended zooming when hitting a limit
  }
  unit_ymin += unit_delta_y
  unit_ymax += unit_delta_y
  unit_ymin = max(global_ymin, unit_ymin)
  unit_ymax = min(global_ymax, unit_ymax)
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  left_sidebar_bounds = windowWidth*0.15
  right_sidebar_bounds = windowWidth*0.85
  graph_xmin = left_sidebar_bounds + 50
  graph_xmax = right_sidebar_bounds - 50
  graph_ymin = windowHeight - 60
  graph_ymax = 15 
  zoom_scale = 0.09
  focal_point = [windowWidth/2, windowHeight/2]
  unit_xmin = 0.01
  unit_xmax = 30
  unit_ymin = 0
  unit_ymax = 0.1
  info_header_yloc = windowHeight*0.7
}

function draw() {
  background(color_background);
  plot_curves()
  draw_gui()
}
