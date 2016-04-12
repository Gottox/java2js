/*
 * ProcessingDemo.java
 *
 * Example file
 */

class ProcessingDemo extends processing{
	// Global variables
	float radius = 50.0f;
	int X, Y;
	int nX, nY;
	int delay = 16;

	// Setup the Processing Canvas
	public void setup(){
		this.size(200, 200);
		this.strokeWeight( 10 );
		this.frameRate(15);
		this.X = width / 2;
		this.Y = width / 2;
		this.nX = this.X;
		this.nY = this.Y;
	}

	// Main draw loop
	public void draw(){

		this.radius = this.radius + sin( this.frameCount / 4 );

		// Track circle to new destination
		this.X+=(this.nX-this.X)/this.delay;
		this.Y+=(this.nY-this.Y)/this.delay;

		// Fill canvas grey
		this.background( 100 );

		// Set fill-color to blue
		this.fill( 0, 121, 184 );

		// Set stroke-color white
		this.stroke(255);

		// Draw circle
		this.ellipse( this.X, this.Y, this.radius, this.radius );
	}


	// Set circle's next destination
	void mouseMoved(){
		this.nX = this.mouseX;
		this.nY = this.mouseY;
	}
}
