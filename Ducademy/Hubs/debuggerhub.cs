using Microsoft.AspNetCore.SignalR;
using Ducademy.SSH;
using Renci.SshNet;
using System.Text;
using Ducademy;
namespace Ducademy.Hubs
{
    public class Debuggerhub : Hub
    {
        private static GDB gdb = new("D:\\Ducademy\\ducamijjang.pem");

        public async Task StartMessage(int _userid)
        {
            if (Int32.Parse(Context.User.FindFirst("id").Value) != _userid)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "Error", "Occur");
                return;
            }
                
            try { gdb.NewShell(_userid); }
            catch (Exception ex) { Console.WriteLine(ex.Message); return; }
            await Clients.Caller.SendAsync("ReceiveMessage", "ad", "ad");
        }


        public async Task RunCode(string _code)
        {
            int userid = Int32.Parse(Context.User.FindFirst("id").Value);
            gdb.SendCode(userid, _code);
            string str = gdb.StartGDB(userid);
            str = str[(str.LastIndexOf("line") + 5)..str.LastIndexOf('.')];
            await Clients.Caller.SendAsync("StackDatas",
                str.Split(' ')[0],
                string.Join('\n', gdb.AllStackVarables(userid)));
        }

        public async Task ExecuteGdbCmd(string _command)
        {
            string str = gdb.ExecuteGDBCmd(Int32.Parse(Context.User.FindFirst("id").Value), _command);
            //str = str[_command.Length..^str.FirstIndexOf(' ')];
            str = str.Substring(_command.Length, 3);
            await Clients.Caller.SendAsync("StackDatas",
                str,
                string.Join('\n', gdb.AllStackVarables(Int32.Parse(Context.User.FindFirst("id").Value))));
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            gdb.RemoveShell(Int32.Parse(Context.User.FindFirst("id").Value));
            return Task.CompletedTask;
        }
    }
}
