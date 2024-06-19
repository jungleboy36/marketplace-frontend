import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { HomeService } from '../services/home.service';
import * as ApexCharts from 'apexcharts';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: []
})

export class DashboardAdminComponent {
  public documentCount: any = {
    client: 0,
    company: 0,
    offers: 0,
    demandes: 0
  };  public chartOptions: any;

  constructor(private adminService : AdminService){
    this.adminService.dashboard().subscribe(data => {
      console.log('data:', data);
      const payments = data.payments;
      this.documentCount.client = data.client_count;
      this.documentCount.company = data.company_count;
      this.documentCount.offers = data.offres_count;
      this.documentCount.demandes = data.demandes_count;
      const monthlyTotals = this.calculateMonthlyTotals(payments);
      this.initChart(monthlyTotals);
    });
    

  }
  ngOnInit(): void {

  }


  calculateMonthlyTotals(payments: any[]): { month: string, total: number }[] {
    const monthlyTotals: { [key: string]: number } = {};

    payments.forEach(payment => {
      const paymentDate = new Date(payment.time);
      const monthYear = `${paymentDate.getMonth() + 1}-${paymentDate.getFullYear()}`;
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = 0;
      }
      monthlyTotals[monthYear] += payment.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);
      return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
    });

    return sortedMonths.map(month => ({ month, total: monthlyTotals[month] }));
  }

  initChart(monthlyTotals: { month: string, total: number }[]): void {
    const categories = monthlyTotals.map(mt => mt.month);
    const series = monthlyTotals.map(mt => mt.total);

    this.chartOptions = {
      series: [{
        name: 'Total Amount',
        data: series
      }],
      chart: {
        type: 'bar',
        height: 350
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Month-Year'
        }
      },
      yaxis: {
        title: {
          text: 'Total Amount'
        }
      },
      title: {
        text: 'Total Payments per Month'
      }
    };

    const chart = new ApexCharts(document.querySelector("#chart"), this.chartOptions);
    chart.render();
  }
}
