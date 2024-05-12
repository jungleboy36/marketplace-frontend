import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { interval, switchMap } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: []
})
export class ChatComponent implements OnInit,AfterViewInit {
  @ViewChild('chatContainer') chatContainerRef!: ElementRef;
  conversations: any[] = [];
  selectedConversation: any = null;
  newMessage: string = '';
  userId : string ='';
  messages : any= [];
  picture : any;
  profilePicture: string | null = null;
  constructor(private chatService: ChatService, public authService : AuthService) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.fetchConversations();
    this.profilePicture =localStorage.getItem('profileImageUrl');
    //this.fetchDataEveryFiveSeconds()
    
  }

  fetchConversations() {
    this.chatService.getConversations(this.userId).subscribe(
      (conversations: any[]) => {
        this.conversations = conversations;
        if(this.conversations.length >0){
        this.selectConversation(this.conversations[0]);}
        this.conversations.forEach(conversation => {
          this.LoadPicture(conversation);
        });


      },
      (error) => {
        console.error('Error fetching conversations:', error);
      }
    );
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.fetchMessages(conversation.id);
  }

  fetchMessages(conversationId: string) {
    this.chatService.getMessages(conversationId).subscribe(
      (messages: any[]) => {
        this.messages = messages;
        console.log("messages: ",this.messages);
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  sendMessage() {
    const message = {
      conversation_id: this.selectedConversation.id,
      message: this.newMessage,
      sender_id : this.getSenderId(this.selectedConversation)!,
      display_name : this.getDisplayName(this.selectedConversation)!
    };

    this.chatService.sendMessage(message).subscribe(
      (response) => {
        this.newMessage = '';
        this.fetchMessages(this.selectedConversation.id);
        this.scrollToBottom();

      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }

  getDisplayName(conversation: any) : string | null {
    const display_name = this.authService.getDisplayName();
    if (conversation.display_names[0] == display_name ){
      return conversation.display_names[1]}
    return conversation.display_names[0]

    }

    LoadPicture(conversation: any){
      const Id = this.getSenderId(conversation);
      const conversation_id = conversation.id;
      // Call your service method to load the picture
      this.chatService.getUserProfile(Id!).subscribe(
        (profile: any) => {
          this.picture = profile.image;
          localStorage.setItem('conversation_image/' + conversation_id, this.picture);
        },
        (error) => {
          console.error('Error fetching conversation picture:', error);
        }
      );
      // Return the picture URL
    }
    
    getPicture(conversation:any){
      return localStorage.getItem('conversation_image/'+conversation.id);
    }

    getSenderId(conversation : any): string | null {
      
      if (conversation.participants[0] == this.userId ){
        return conversation.participants[1]}
      return conversation.participants[0]
  
      }
      isEmpty(message: string) : boolean {
        return message.trim() != '';
      }
      ngAfterViewInit() {
        // Scroll to the bottom of the chat container after the view is initialized
        this.scrollToBottom();
      }
      scrollToBottom() {
        // After adding new content to the chat container
// Select all elements with the class "simplebar-content-wrapper"
const contentWrappers = document.querySelectorAll('.simplebar-content-wrapper');

// Check if there are at least three elements with the class
if (contentWrappers.length >= 3) {
    // Get the third element (index 2 because JavaScript arrays are zero-based)
    const thirdContentWrapper = contentWrappers[2];
    thirdContentWrapper.scrollTop = thirdContentWrapper.scrollHeight;
    // Now you can work with the third content wrapper element
    console.log(thirdContentWrapper);
} else {
    // Handle the case where there are fewer than three elements with the class
    console.log('There are fewer than three elements with the class "simplebar-content-wrapper"');
}

      }

      fetchDataEveryFiveSeconds(): void {
        interval(3000).pipe(
          switchMap(() => this.chatService.getConversations(this.userId))
        ).subscribe((conversations: any[]) => {
          this.conversations = conversations;
          this.conversations.forEach(conversation => {
            this.LoadPicture(conversation);
          });
        }, (error) => {
          console.error('Error fetching conversations:', error);
        });
    
        interval(3000).pipe(
          switchMap(() => this.chatService.getMessages(this.selectedConversation.id))
        ).subscribe((messages: any[]) => {
          this.messages = messages;
          console.log("messages: ", this.messages);
        }, (error) => {
          console.error('Error fetching messages:', error);
        });
      } 
  }

