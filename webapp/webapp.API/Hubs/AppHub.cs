using Microsoft.AspNetCore.SignalR;

namespace webapp.API.Hubs;

public class AppHub : Hub
{
    public async Task Server(string message)
    {
        var response = message == "hello" ? "Hello from server" : "Hi from server";
        
        await Clients.Client(Context.ConnectionId)
            .SendAsync("ServerResponse",response);
    }
}