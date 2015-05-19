/*
 * HelloWorld.java
 * Copyright (C) 2015 tox <tox@rootkit>
 *
 * Distributed under terms of the MIT license.
 */

public class HelloWorld
{
	int number = 42;
	String string = "Hello World";
	public HelloWorld() {
		System.out.println("Foobar");
	}
	public void action(String hello) {
		int localNumber = 42;
		if(number == 24)
			System.out.println(hello);
		else
			System.out.println("Not 42");
	}
}

