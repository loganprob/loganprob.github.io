
let left_sidebar_bounds, right_sidebar_bounds
let graph_xmin, graph_xmax, graph_ymin, graph_ymax, zoom_scale, focal_point
let unit_xmin, unit_xmax, unit_ymin, unit_ymax
var global_ymin = -0.05
var global_ymax = 0.25
var global_min_ydelta = 0.025


//let slider_quality, slider_xmin, slider_xmax, slider_ymin, slider_ymax
//let toggle_par, toggle_spot, toggle_fwd

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

function draw_gui() { // everything besides plots
  // left sidebar widgets & labels
  
  noStroke()
  textSize(16)
  text(`abs mouse X: ${mouseX}`, 10, 30)
  text(`abs mouse Y: ${mouseY}`, 10, 50)
  text(`rltv mouse X: ${abs_to_relative_x(mouseX)}`, 10, 80)
  text(`rltv mouse Y: ${abs_to_relative_y(mouseY)}`, 10, 100)
  text(`unit mouse X: ${relative_to_unit_x(abs_to_relative_x(mouseX))}`, 10, 130)
  text(`unit mouse Y: ${relative_to_unit_y(abs_to_relative_y(mouseY))}`, 10, 150)
  text(`unit xmin: ${unit_xmin}`, 10, 180)
  text(`unit xmax: ${unit_xmax}`, 10, 200)
  text(`unit ymin: ${unit_ymin}`, 10, 220)
  text(`unit ymax: ${unit_ymax}`, 10, 240)
  text(`ygrid scale: ${1}`, 10, 270)
  
  
  
  
  /*
  noStroke()
  textSize(16)
  textFont('Consolas')
  text("Current Yield Curves:", 10, 20)
  textSize(12)
  text("US Treasury:", 10, 40)
  
  textSize(16)
  text("Graph Settings:", 10, 300)
  textSize(12)
  text("Quality:", 10, 322)
  text("Quality:", 10, 342)
  
  
  text("Tool Info:", 10, 600)
  textSize(12)
  text("Data as of: 10/24/23", 10, 620)
  text("Code version: 10/24/23", 10, 640)
  textSize(16)
  
  */
  
  stroke('black')
  line(left_sidebar_bounds, 0, left_sidebar_bounds, windowHeight)
  line(right_sidebar_bounds, 0, right_sidebar_bounds, windowHeight)
  
  // graph area
  line(graph_xmin, graph_ymin, graph_xmax, graph_ymin)
  line(graph_xmin, graph_ymin, graph_xmin, graph_ymax)
  line(focal_point[0], windowHeight/2, focal_point[0],  windowHeight/2+zoom_scale)
  
  // drawing gridlines
  if (unit_ymax-unit_ymin<0.075) {
    y_grid_scale = 0.005
  } else if (unit_ymax-unit_ymin<0.15) {
    y_grid_scale = 0.01
  } else {
    y_grid_scale = 0.02
  }
  drawingContext.setLineDash([1, 15])
  for (let y_grid=Math.ceil(unit_ymin*100)/100; y_grid<unit_ymax; y_grid+=y_grid_scale) {
    noStroke()
    textAlign(RIGHT, CENTER)
    y_tick = round(y_grid*100,2)
    text(`${isNaN(y_tick) ? '0' : y_tick}%`, graph_xmin-5, unit_to_pxl_y(y_grid))
    stroke('black')
    line(graph_xmin,unit_to_pxl_y(y_grid),graph_xmax,unit_to_pxl_y(y_grid))
  }
  textAlign(LEFT, TOP)
  drawingContext.setLineDash([])
  
}

function mouseWheel(event) {
  if (event.clientX<graph_xmin || event.clientX>graph_xmax || event.clientY>graph_ymin || event.clientY<graph_ymax) {
    return // do nothing if mouse not in graph area
  }
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

    
function mouseDragged(event) {
  //delta_x_pxl = event.movementX
  delta_y_pxl = event.movementY
  unit_delta_y = -delta_y_pxl/(graph_ymax-graph_ymin)*(unit_ymax-unit_ymin)
  //console.log(delta_x_pxl/(graph_xmax-graph_xmin))
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
  left_sidebar_bounds = windowWidth*0.2
  right_sidebar_bounds = windowWidth*0.99
  graph_xmin = left_sidebar_bounds + 50
  graph_xmax = right_sidebar_bounds - 50
  graph_ymin = windowHeight - 50
  graph_ymax = 50
  zoom_scale = 0.09
  focal_point = [windowWidth/2, windowHeight/2]
  unit_xmin = 0.01
  unit_xmax = 30
  unit_ymin = 0
  unit_ymax = 0.1
  
  
  /*
  toggle_par = createCheckbox('Par Curve (coupon)', true)
  toggle_spot = createCheckbox('Treasury Spot Curve', true)
  toggle_fwd = createCheckbox('Plot Fowd Curve', true)
  toggle_par.style('font-family', 'Consolas')
  toggle_spot.style('font-family', 'Consolas')
  toggle_fwd.style('font-family', 'Consolas')
  toggle_par.position(10,50)
  toggle_spot.position(10,70)
  toggle_fwd.position(10,190)
  
  slider_quality = createSlider(10,100,50)
  slider_xmin = createSlider(-0.05,0.2,0.0, 0.005)
  slider_quality.position(80,310)
  slider_xmin.position(80,330)
  */
  
}

function draw() {
  background(220);
  
  draw_gui()
  
}
