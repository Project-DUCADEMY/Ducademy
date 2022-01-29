#include <stdio.h>
int main()
{
int a;
int b;

a = 10;
b = 5;
int c = a + b;
if(c > a)
{
a = b;
}
else
b = a;
return 0;
}