package com.operit.app;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the Calculator class
 */
@DisplayName("Calculator Tests")
class CalculatorTest {
    
    private final Calculator calculator = new Calculator();
    
    @Test
    @DisplayName("Addition test")
    void testAdd() {
        assertEquals(8, calculator.add(5, 3));
        assertEquals(0, calculator.add(-5, 5));
        assertEquals(-8, calculator.add(-5, -3));
    }
    
    @Test
    @DisplayName("Subtraction test")
    void testSubtract() {
        assertEquals(2, calculator.subtract(5, 3));
        assertEquals(-10, calculator.subtract(-5, 5));
    }
    
    @Test
    @DisplayName("Multiplication test")
    void testMultiply() {
        assertEquals(15, calculator.multiply(5, 3));
        assertEquals(0, calculator.multiply(5, 0));
        assertEquals(-15, calculator.multiply(-5, 3));
    }
    
    @Test
    @DisplayName("Division test")
    void testDivide() {
        assertEquals(2.5, calculator.divide(5, 2));
        assertEquals(0.0, calculator.divide(0, 5));
    }
    
    @Test
    @DisplayName("Division by zero should throw an exception")
    void testDivideByZero() {
        assertThrows(ArithmeticException.class, () -> {
            calculator.divide(5, 0);
        });
    }
    
    @Test
    @DisplayName("Array sum test")
    void testSum() {
        int[] numbers = {1, 2, 3, 4, 5};
        assertEquals(15, calculator.sum(numbers));
        
        int[] emptyArray = {};
        assertEquals(0, calculator.sum(emptyArray));
    }
}
