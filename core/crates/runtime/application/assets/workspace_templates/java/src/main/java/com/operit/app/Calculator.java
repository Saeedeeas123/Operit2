package com.operit.app;

/**
 * A simple calculator class
 * Used to demonstrate class structure and unit tests
 */
public class Calculator {
    
    /**
     * Addition operation
     */
    public int add(int a, int b) {
        return a + b;
    }
    
    /**
     * Subtraction operation
     */
    public int subtract(int a, int b) {
        return a - b;
    }
    
    /**
     * Multiplication operation
     */
    public int multiply(int a, int b) {
        return a * b;
    }
    
    /**
     * Division operation
     */
    public double divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("The divisor cannot be 0");
        }
        return (double) a / b;
    }
    
    /**
     * Sum an array
     */
    public int sum(int[] numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return total;
    }
}
