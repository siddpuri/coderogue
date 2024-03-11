#### News

* March 10, 2024: HTTPS is working

  * You can now access coderogue.net from school computers! That took
    more effort than you might think. :-)

  * You can now access coderogue.net by either http or https. That
    meant I had to buy a certificate and install it on the server so
    that your web browser can tell if the server is for real. If you
    remember what you learned in Unit 8, you'll be relieved to know
    that you can now type in your password without being afraid that
    some evil hacker will intercept it.

* December 4, 2023: Coderogue is running again

  * Over the summer, I rewrote the client to use React. That took me
    way more time than it was supposed to, but in the end everything
    still seems to work. So you shouldn't see any differences, except
    for a few cosmetic improvements.
  
  * The Code tab now shows both your code and the server log side by
    side to make debuggine easier.
  
  * The new freeze/thaw buttons on the Code tab freeze both the log
    and the game display. The actual game keeps going on the server,
    of course, but you can freeze your updates an inspect what was
    going on at the time you saw a particular log message.
  
  * Account validation isn't implemented yet. The system is supposed
    to validate your @lwsd e-mail address by sending you an e-mail.
    For now, please just use your actual e-mail so I can keep track
    of who is who. At some point I'll remove all the accounts that
    don't have valid lwsd addresses.
