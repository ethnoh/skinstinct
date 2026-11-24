export async function register() {
 if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.NEXT_PHASE!=='phase-production-build'&&process.env.WHATSAPP_ENABLED==='true') {
  const {processBookingNotifications}=await import('./lib/booking-notifications');
  const state=globalThis as typeof globalThis&{skNotificationTimer?:ReturnType<typeof setInterval>;skNotificationBusy?:boolean};
  if(state.skNotificationTimer)return;
  const run=async()=>{if(state.skNotificationBusy)return;state.skNotificationBusy=true;try{await processBookingNotifications()}catch{console.error('Notification worker failed; inspect administrator delivery status.')}finally{state.skNotificationBusy=false}};
  state.skNotificationTimer=setInterval(run,30000);state.skNotificationTimer.unref();
  void run();
 }
}
