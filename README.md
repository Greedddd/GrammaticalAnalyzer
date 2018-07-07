# GrammaticalAnalyzer
编译原理：语法分析器

### 入口

FrontEnd.html

### 使用技术：JS



### 使用方法

先在左下角输入框里输入**文法**,按**分析表构建**按钮,自动生成文法的SLR(0)分析表,后台有生成goto表和action表，项目集规范族等，但在网页端没有输出显示。有下角的**输入串分析框**内可输入需要分析的字符串，按分析按钮，右上角输出框中可输出分析过程，是否符合文法等。



### 介绍

本网页可视化显示语法分析的过程,可动态加载不同的文法。

- 左上角显示生成的SLR(0)分析表, 
- 左下角是自输入的文法
- 右下角是可输入需要进行语法分析的字符串
- 右下角显示语法分析的过程，错误的时候也能显示错误的位置行号和错误提示;

### 程序流程图

 ![](https://github.com/Greedddd/GrammaticalAnalyzer/raw/master/image/1.png)

### 演示

 ![](https://github.com/Greedddd/GrammaticalAnalyzer/raw/master/image/2.png)
 
输入产生式E->E+E，E->E/E，E->E-E，E->E*E，E->(E) ，E->i，生成SLR分析表：
 ![](https://github.com/Greedddd/GrammaticalAnalyzer/raw/master/image/3.png)

输入句子i+i-i/i*i，进行语法分析：
 ![](https://github.com/Greedddd/GrammaticalAnalyzer/raw/master/image/4.png)
